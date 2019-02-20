<?php
 
/**
 * Create new CPT - Family
 */
 
class CPT_Family extends CPT_Core {

    const POST_TYPE = 'family';
	const TEXTDOMAIN = '_s';
	
	/**
     * Register Custom Post Types. See documentation in CPT_Core, and in wp-includes/post.php
     */
    public function __construct() {

 		
		// Register this cpt
        // First parameter should be an array with Singular, Plural, and Registered name
        parent::__construct(
        
        	array(
				__( 'Family', self::TEXTDOMAIN ), // Singular
				__( 'Families', self::TEXTDOMAIN ), // Plural
				self::POST_TYPE // Registered name/slug
			),
			array( 
				'public'              => true,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'query_var'           => true,
				'capability_type'     => 'post',
				'has_archive'         => true,
				'hierarchical'        => false,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_nav_menus'   => true,
				'exclude_from_search' => false,
				'rewrite'             => array( 'slug' => 'families' ),
				'supports' => array( 'title', 'author' ),
                'menu_icon' => 'dashicons-groups'
			)

        );
        
        add_filter('pre_get_posts', array( $this, 'query_filter' ) );
        
        // add_filter( 'manage_edit-job_sortable_columns', array( $this, 'sortable_columns' ) );
		        
     }
    
    
     /**
	 * Registers admin columns to display. Hooked in via CPT_Core.
	 * @since  0.1.0
	 * @param  array  $columns Array of registered column names/labels
	 * @return array           Modified array
	 */
	public function columns( $columns ) {
        
        $columns['date'] = 'Created Date';
        $columns['author'] = 'User';
        
        unset( $columns['post_type'] );        
        
		$new_column = array(
			'amount_owing' => 'Amount Owing'
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
			case 'amount_owing':
                $amount_owing = get_field( 'amount_owing', $post_id );
                $amount_owing = $amount_owing ? $amount_owing : 0;
                echo '$' . number_format( $amount_owing, 2 );
				break;
		}
	}
    
    
    public function query_filter( $query ) {
	    
        if( is_admin() ) {
            // $this->sort_admin( $query );
        }
        else {
            if ( $query->is_main_query() && is_post_type_archive( 'family' ) ) {
                
                $today = current_time( 'Ymd' ); // local time set under Settings > General
                                
                $meta_query = array(
        
                    array(
                        'key'			=> 'amount_owing',
                        'compare'		=> '>',
                        'value'			=> (int) 0, // needed
                        'type'          => 'numeric' // needed
                    ),
                    array(
                        'key'		=> 'start_date',
                        'compare'	=> '<=',
                        'value'		=> $today,
                    )
        
                );
                
                $query->set( 'meta_query', $meta_query );
                $query->set( 'meta_key', 'start_date' );	
                $query->set( 'orderby', 'meta_value_num' );	
                $query->set( 'order', 'ASC' );
                $query->set('posts_per_page', 12 );
            }
        }
        			
	}
    
    
    private function sort_admin( $query ) {
        
        $orderby = $query->get( 'orderby');
        //$order   = $query->get( 'order');
                
        if( 'closing_date' == $orderby ) {
            $query->set( 'meta_key', 'closing_date' );	
			$query->set( 'orderby', 'meta_value_num' );
        }   
    }
}

new CPT_Family();
