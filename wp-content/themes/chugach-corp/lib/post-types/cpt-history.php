<?php
 
/**
 * Create new CPT - History
 */
 
class CPT_History extends CPT_Core {

    const POST_TYPE = 'history';
	const TEXTDOMAIN = '_s';
	
	/**
     * Register Custom Post Types. See documentation in CPT_Core, and in wp-includes/post.php
     */
    public function __construct() {

 		
		// Register this cpt
        // First parameter should be an array with Singular, Plural, and Registered name
        parent::__construct(
        
        	array(
				__( 'History', self::TEXTDOMAIN ), // Singular
				__( 'History', self::TEXTDOMAIN ), // Plural
				self::POST_TYPE // Registered name/slug
			),
			array( 
				'public'              => true,
				'publicly_queryable'  => false,
				'show_ui'             => true,
				'query_var'           => true,
				'capability_type'     => 'post',
				'has_archive'         => false,
				'hierarchical'        => false,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_nav_menus'   => false,
				'exclude_from_search' => false,
				'rewrite'             => array( 'slug' => 'history' ),
				'supports' => array( 'title', 'thumbnail', 'editor', 'revisions' ),
                'menu_icon' => 'dashicons-calendar-alt'
			)

        );
        
        add_filter('pre_get_posts', array( $this, 'query_filter' ) );
        		        
     }
    
    
     /**
	 * Registers admin columns to display. Hooked in via CPT_Core.
	 * @since  0.1.0
	 * @param  array  $columns Array of registered column names/labels
	 * @return array           Modified array
	 */
	public function columns( $columns ) {
        
        $columns['date'] = 'Posted Date';
        
        unset( $columns['post_type'] );
        
		$new_column = array(
			'year_start' => 'Year Start',
		);
		return array_slice( $columns, 0, 2, true ) + $new_column + array_slice( $columns, 1, null, true );
	}

	/**
	 * Handles admin column display. Hooked in via CPT_Core.
	 * @since  0.1.0
	 * @param  array  $column Array of registered column names
	 */
	public function columns_display( $column, $post_id ) {
		switch ( $column ) {
			case 'year_start':
                echo get_field( 'year_start' );
				break;
		}
	}
    
    
    public function query_filter( $query ) {
	    
        if ( $query->is_main_query() && is_post_type_archive( 'history' ) ) {
            $query->set( 'meta_key', 'year_start' );	
            $query->set( 'orderby', 'meta_value_num' );
            $query->set( 'order', 'DESC' ); 	
            
            if( ! is_admin() ) {
                $query->set('posts_per_page', -1 );
            }		
        }
                			
	}
    
    
    
}

new CPT_History();
