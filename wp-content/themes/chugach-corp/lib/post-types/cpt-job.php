<?php

/**
 * Create new CPT - Job
 */

class CPT_Job extends CPT_Core {

    const POST_TYPE = 'job';
	const TEXTDOMAIN = '_s';

	/**
     * Register Custom Post Types. See documentation in CPT_Core, and in wp-includes/post.php
     */
    public function __construct() {


		// Register this cpt
        // First parameter should be an array with Singular, Plural, and Registered name
        parent::__construct(

        	array(
				__( 'Job', self::TEXTDOMAIN ), // Singular
				__( 'Jobs', self::TEXTDOMAIN ), // Plural
				self::POST_TYPE // Registered name/slug
			),
			array(
				'public'              => false,
				'publicly_queryable'  => true,
				'show_ui'             => true,
				'query_var'           => true,
				'capability_type'     => 'post',
				'has_archive'         => false,
				'hierarchical'        => false,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_nav_menus'   => false,
				'exclude_from_search' => false,
				//'rewrite'             => array( 'slug' => 'teams' ),
				'supports' => array( 'title', 'editor', 'revisions' ),
                'menu_icon' => 'dashicons-format-status'
			)

        );

     }

}

new CPT_Job();
