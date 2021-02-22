<?php

/**
 * Create new CPT - People
 */

class Taxonomy_Faq_Category extends Taxonomy_Core {

    const TEXTDOMAIN = '_s';

    /**
     * Register Custom Post Types. See documentation in Taxonomy_Core, and in wp-includes/post.php
     */
    public function __construct() {

            $names = array(
                __( 'FAQ Category', self::TEXTDOMAIN ), // Singular
                __( 'FAQ Categories', self::TEXTDOMAIN ), // Plural
                'faq-category' // Registered name
            );
            // Will register an 'Actress' Taxonomy to 'movies' post-type
            $actresses = register_via_taxonomy_core( $names, array(), array( 'faq' ) );

     }

}

new Taxonomy_Faq_Category();
