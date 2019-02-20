<?php

/****************************************
	WordPress Cleanup functions - work in progress
*****************************************/
	include_once( 'wp-cleanup.php' );


/****************************************
	Theme Settings - load main stylesheet, add body classes
*****************************************/
	include_once( 'theme-settings.php' );



/****************************************
	include_onces (libraries, Classes etc)
*****************************************/
	include_once( 'includes/cpt-core/CPT_Core.php' );

	include_once( 'includes/taxonomy-core/Taxonomy_Core.php' );
    
    include_once( 'includes/table-class.php' );
    
    // Terms - has filter for post_type
    include_once( 'includes/theme-functions/terms.php' );

    include_once( 'includes/theme-functions/shortcodes.php' );
    include_once( 'includes/theme-functions/html.php' );
    include_once( 'includes/theme-functions/array.php' );

/****************************************
	Functions
*****************************************/

    include_once( 'functions/svg.php' );

	include_once( 'functions/theme.php' );
    
    include_once( 'functions/videos.php' );

	include_once( 'functions/template-tags.php' );

	include_once( 'functions/acf.php' );

	include_once( 'functions/fonts.php' );

	include_once( 'functions/scripts.php' );

	include_once( 'functions/social.php' );

	include_once( 'functions/menus.php' );
    
	include_once( 'functions/gravity-forms.php' );
    
    include_once( 'functions/gravity-forms-user-activation.php' );

	include_once( 'functions/books.php' );
    
    include_once( 'functions/blog.php' );
    
    include_once( 'functions/addtoany.php' );
    
    include_once( 'functions/facetwp.php' );
    
    include_once( 'functions/redirects.php' );
    
    include_once( 'functions/members.php' );
    
    include_once( 'functions/user-profile.php' );
    
    include_once( 'functions/family.php' );
    
/****************************************
	include_onces (Foundation)
*****************************************/

include_once( 'foundation/class-foundation.php' );
include_once( 'foundation/class-foundation-tabs.php' );

/****************************************
	Page Builder
*****************************************/

    include_once( 'page-builder/init.php' );

/****************************************
	Post Types
*****************************************/
    
    include_once( 'post-types/cpt-book.php' );
    include_once( 'post-types/cpt-family.php' );
    include_once( 'post-types/cpt-people.php' );    
    
/****************************************
	Widgets
*****************************************/

    include_once( 'widgets/widget-social.php' );
        