-- Get the comment by its id and all its descendant comments
CREATE OR REPLACE FUNCTION get_comment_descendants(comment_id BIGINT)
RETURNS TABLE (
    id BIGINT,
    parent_id BIGINT,
    content CHARACTER VARYING
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE descendants AS (
        SELECT c.id, c.parent_id, c.content
        FROM public."comment" c
        WHERE c.id = comment_id
        UNION ALL
        SELECT c.id, c.parent_id, c.content
        FROM public."comment" c
        INNER JOIN descendants d ON c.parent_id = d.id
    )
    SELECT d.id, d.parent_id, d.content
    FROM descendants d;
END;
$$ LANGUAGE plpgsql;


-- Get the count of all the descendants of a comment by its id
CREATE OR REPLACE FUNCTION build_comment_tree(comments JSONB, parent_id BIGINT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    comment JSONB;
    children JSONB;
    first_reply JSONB;
    descendant_count INT := 0;
    child JSONB;
    child_id BIGINT;
BEGIN
    SELECT INTO comment * FROM jsonb_array_elements(comments) AS value WHERE (value->>'id')::BIGINT = parent_id;

    IF comment IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT jsonb_agg(value) INTO children
    FROM jsonb_array_elements(comments) AS value
    WHERE (value->>'parent_id')::BIGINT = parent_id;

    first_reply := NULL;

    IF children IS NOT NULL THEN
        descendant_count := jsonb_array_length(children);
        FOR child IN SELECT * FROM jsonb_array_elements(children)
        LOOP
            child_id := (child->>'id')::BIGINT;
            descendant_count := descendant_count + COALESCE((build_comment_tree(comments, child_id)->>'count')::INT, 0);
            IF first_reply IS NULL THEN
                first_reply := build_comment_tree(comments, child_id);
            END IF;
        END LOOP;
    END IF;

    RETURN jsonb_build_object(
        'id', comment->>'id',
        'content', comment->>'content',
        'count', descendant_count,
        'firstReply', first_reply
    );
END;
$$ LANGUAGE plpgsql;


-- Get list of root comments nested by their first replies
CREATE OR REPLACE FUNCTION get_comment_trees_by_post_id(post_id BIGINT)
RETURNS JSONB AS $$
DECLARE
    comment_trees JSONB := '[]'::JSONB;
    comment_tree JSONB;
BEGIN
    FOR comment_tree IN
        SELECT build_comment_tree(
            (WITH descendants AS (
                SELECT * FROM get_comment_descendants(c.id)
            )
            SELECT jsonb_agg(row_to_json(descendants)) FROM descendants),
            c.id
        ) AS comment_tree
        FROM public."comment" c
        WHERE c.post_id = get_comment_trees_by_post_id.post_id AND c.parent_id IS NULL
    LOOP
        comment_trees := comment_trees || jsonb_build_array(comment_tree);
    END LOOP;

    RETURN comment_trees;
END;
$$ LANGUAGE plpgsql;