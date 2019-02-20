<?php
/**
 * Template part for displaying posts.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package _s
 */
?>

<?php

// Register/ Login tabs
function register_login_tabs() {
    $template = get_page_template_slug( get_the_ID() );
    $current_page_id = _s_get_page_id_from_template_name( $template );
    $pages = [];   
    $register_page_id = _s_get_page_id_from_template_name( 'page-templates/register.php' );
    if( $register_page_id ) {
        $pages[$register_page_id] = $register_page_id;
        
    }
    $login_page_id = _s_get_page_id_from_template_name( 'page-templates/login.php' );
    if( $login_page_id ) {
        $pages[$login_page_id] = $login_page_id;
    }
    
    if( ! empty( $pages ) ) {
        
        foreach( $pages as $page ) {
            
            if( $current_page_id == $page  ) {
                $pages[$page] = sprintf( '<li class="is-active"><span><h3>%s</h3></span></li>', 
                        get_the_title( $page )
                      );
            } else {
                $pages[$page] = sprintf( '<li><a href="%s"><h3>%s</h3></a></li>', 
                        get_permalink( $page ),
                        get_the_title( $page )
                      );   
            }
        }
        
        $tabs = join( '', $pages );
        printf( '<ul class="tabs">%s</ul>', $tabs );
    }
    
}

?>


<div class="tabs-container">
    <?php
    register_login_tabs();
    ?>
    <div class="tabs-content">
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            <div class="entry-content">
                <?php
                    the_content();
                ?>
            </div><!-- .entry-content -->
        </article><!-- #post-## -->
    </div>
</div>