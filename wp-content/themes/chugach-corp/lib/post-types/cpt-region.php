<?php
 
/**
 * Create new CPT - Region
 */
 
class CPT_Region extends CPT_Core {

    const POST_TYPE = 'region';
	const TEXTDOMAIN = '_s';
	
	/**
     * Register Custom Post Types. See documentation in CPT_Core, and in wp-includes/post.php
     */
    public function __construct() {

 		
		// Register this cpt
        // First parameter should be an array with Singular, Plural, and Registered name
        parent::__construct(
        
        	array(
				__( 'Region', self::TEXTDOMAIN ), // Singular
				__( 'Regions', self::TEXTDOMAIN ), // Plural
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
				'rewrite'             => false,
				'supports' => array( 'title', 'thumbnail', 'editor', 'revisions' ),
                //'menu_icon' => 'dashicons-admin-site-alt3'
			)

        );
                		        
     }    
}

new CPT_Region();
