<?php

/**
 * Extend get terms with post type parameter.
 *
 * @global $wpdb
 * @param string $clauses
 * @param string $taxonomy
 * @param array $args
 * @return string
 */
function df_terms_clauses( $clauses, $taxonomy, $args ) {
	if ( isset( $args['post_type'] ) && ! empty( $args['post_type'] ) && $args['fields'] !== 'count' ) {
		global $wpdb;

		$post_types = array();

		if ( is_array( $args['post_type'] ) ) {
			foreach ( $args['post_type'] as $cpt ) {
				$post_types[] = "'" . $cpt . "'";
			}
		} else {
			$post_types[] = "'" . $args['post_type'] . "'";
		}

		if ( ! empty( $post_types ) ) {
			$clauses['fields'] = 'DISTINCT ' . str_replace( 'tt.*', 'tt.term_taxonomy_id, tt.taxonomy, tt.description, tt.parent', $clauses['fields'] ) . ', COUNT(p.post_type) AS count';
			$clauses['join'] .= ' LEFT JOIN ' . $wpdb->term_relationships . ' AS r ON r.term_taxonomy_id = tt.term_taxonomy_id LEFT JOIN ' . $wpdb->posts . ' AS p ON p.ID = r.object_id';
			$clauses['where'] .= ' AND (p.post_type IN (' . implode( ',', $post_types ) . ') OR p.post_type IS NULL)';
			$clauses['orderby'] = 'GROUP BY t.term_id ' . $clauses['orderby'];
		}
	}
	return $clauses;
}

add_filter( 'terms_clauses', 'df_terms_clauses', 10, 3 );
