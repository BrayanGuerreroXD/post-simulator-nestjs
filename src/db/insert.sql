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
        'id', (comment->>'id')::BIGINT,
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



-- Build the comment tree with pagination
CREATE OR REPLACE FUNCTION build_comment_tree_pagination(comment_id BIGINT)
RETURNS JSONB AS $$
DECLARE
    comments JSONB;
    comment JSONB;
    first_reply JSONB;
    descendant_count INT := 0;
BEGIN
    -- Get all descendants of the specified comment
    SELECT jsonb_agg(jsonb_build_object(
        'id', d.id,
        'parent_id', d.parent_id,
        'content', d.content
    )) INTO comments
    FROM get_comment_descendants(comment_id) d;

    -- Get the specified comment
    SELECT INTO comment * 
    FROM jsonb_array_elements(comments) AS value 
    WHERE (value->>'id')::BIGINT = comment_id;

    IF comment IS NULL THEN
        RETURN NULL;
    END IF;

    -- Get the first direct child of the specified comment
    SELECT jsonb_build_object(
               'id', (value->>'id')::BIGINT,
               'content', value->>'content'
           ) INTO first_reply
    FROM jsonb_array_elements(comments) AS value
    WHERE (value->>'parent_id')::BIGINT = comment_id
    ORDER BY (value->>'id')::BIGINT
    LIMIT 1;

    -- Calculate the count of descendants (subtract 1 to exclude the comment itself)
    descendant_count := COALESCE(jsonb_array_length(comments), 0) - 1;

    -- Adjust the count to be >= 0
    descendant_count := GREATEST(descendant_count, 0);

    -- Return the result in the specified structure
    RETURN jsonb_build_object(
        'id', (comment->>'id')::BIGINT,
        'content', comment->>'content',
        'count', descendant_count,
        'firstReply', first_reply
    );
END;
$$ LANGUAGE plpgsql;


-- Get the comment tree with pagination by the comment id
CREATE OR REPLACE FUNCTION get_comment_tree_pagination_by_comment_id(comment_id BIGINT, page INT, page_size INT)
RETURNS JSONB AS $$
DECLARE
    comment_trees JSONB := '[]'::JSONB;
    comment_tree JSONB;
BEGIN
    -- Iterate over the paginated comments and build the comment trees
    FOR comment_tree IN
        SELECT build_comment_tree_pagination(c.id) AS comment_tree
        FROM comment c
        WHERE c.parent_id = comment_id
        ORDER BY c.id
        LIMIT page_size OFFSET ((page - 1) * page_size)
    LOOP
        comment_trees := comment_trees || jsonb_build_array(comment_tree);
    END LOOP;

    RETURN comment_trees;
END;
$$ LANGUAGE plpgsql;


-- Get the comment tree with pagination by the post id
CREATE OR REPLACE FUNCTION get_comment_tree_pagination_by_post_id(postId BIGINT, page INT, page_size INT)
RETURNS JSONB AS $$
DECLARE
    comments JSONB;
    comment_trees JSONB := '[]'::JSONB;
    comment_tree JSONB;
BEGIN
    -- Get paginated root comments for the specified post_id
    SELECT jsonb_agg(to_jsonb(c)) INTO comments
    FROM (
        SELECT c.id, c.parent_id, c.content
        FROM comment c
        WHERE c.post_id = postId
        AND c.parent_id IS NULL
        ORDER BY c.id
        LIMIT page_size OFFSET ((page - 1) * page_size)
    ) c;

    -- Iterate over each comment and build the paginated comment tree
    FOR comment_tree IN
        SELECT build_comment_tree_pagination((c->>'id')::BIGINT) AS comment_tree
        FROM jsonb_array_elements(comments) c
    LOOP
        comment_trees := comment_trees || jsonb_build_array(comment_tree);
    END LOOP;

    RETURN comment_trees;
END;
$$ LANGUAGE plpgsql;

    
-- Drop the index if it exists and create or replace it for comment_id
DROP INDEX IF EXISTS idx_comment_id;
CREATE INDEX idx_comment_id ON public.comment(id);

-- Drop the index if it exists and create or replace it for parent_id
DROP INDEX IF EXISTS idx_comment_parent_id;
CREATE INDEX idx_comment_parent_id ON public.comment(parent_id);

-- Drop the index if it exists and create or replace it for post_id
DROP INDEX IF EXISTS idx_comment_post_id;
CREATE INDEX idx_comment_post_id ON public.comment(post_id);
