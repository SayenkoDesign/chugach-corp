<?php
/*
Template Name: Change Password
*/

if( ! current_user_can( 'subscriber' ) ) {
    wp_redirect( site_url() );
    exit;
}

get_header(); 

_s_get_template_part( 'template-parts/my-account', 'hero' );

?>

<div class="row align-center">

    <div class="large-9 columns">
        <div id="primary" class="content-area">
        
            <main id="main" class="site-main" role="main">
            <?php
            $user_id = get_current_user_id();
            $user_info = get_userdata( $user_id );
            
            printf( '<h4 class="user-first-name text-center">Hi %s,</h4>', $user_info->first_name );
                
            while ( have_posts() ) :
        
                the_post();
                                                    
                _s_get_template_part( 'template-parts/my-account', 'tabs-content' );
                    
            endwhile;
                
            ?>
            </main>
                
        </div>

    </div>
</div>
<?php
get_footer();

