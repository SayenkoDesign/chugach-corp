<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the #content div and all content after.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package _s
 */
?>

</div><!-- #content -->

<?php
   _s_get_template_part( 'template-parts/global', 'footer-cta' );
?>

<footer class="site-footer" id="site-footer" role="contentinfo" itemscope itemtype="https://schema.org/WPFooter">
    <div class="wrap">
    
        <div class="row align-center footer-widgets">
        
            <?php
            
            printf( '<div class="%s column column-block">', 'small-12 medium-6 large-3' );
                $site_url = home_url();
                $logo = sprintf('<img src="%sfooter/footer-logo.svg" class="" />', trailingslashit( THEME_IMG ) );                    
                printf('<aside class="widget widget_media_image text-center"><a href="%s" title="%s">%s</a></aside>',
                        $site_url, get_bloginfo( 'name' ), $logo );
                echo _s_get_social_icons();
            echo '</div>';
            
            if( is_active_sidebar( 'footer-1' ) ){
                printf( '<div class="%s column column-block">', 'small-12 medium-6 large-3' );
                dynamic_sidebar( 'footer-1' );
                echo '</div>';
            }
            
            if( is_active_sidebar( 'footer-2' ) ){
                printf( '<div class="%s column column-block">', 'small-12 medium-6 large-3' );
                dynamic_sidebar( 'footer-2' );
                echo '</div>';
            }
            
            if( is_active_sidebar( 'footer-3' ) ){
                printf( '<div class="%s column column-block">', 'small-12 medium-6 large-3' );
                dynamic_sidebar( 'footer-3' );
                echo '</div>';
            }
            
            ?>            
            
        </div>   
    
        <?php  
        
        if( has_nav_menu( 'footer' ) ) {
            $args = array( 
            'theme_location'  => 'footer', 
                'container'       => false,
                'echo'            => false,
                'items_wrap'      => '%3$s',
                'link_before'     => '<span>',
                'link_after'      => '</span>',
                'depth'           => 0,
            ); 
            
            $menu = sprintf( '%s', str_replace('<a', ' <a', strip_tags( wp_nav_menu( $args ), '<a>' ) ) );
            
        }
            
                  
        $copyright = sprintf( '<p>&copy; %s Chugach Alaska Corporation. All rights reserved. %s</p>', 
                                  date( 'Y' ), $menu );
                                                            
        printf( '<div class="column row footer-copyright">%s</div>', $copyright );

        ?>
     </div>
 
 </footer><!-- #colophon -->

<?php 
 
wp_footer(); 
?>

</div><!--/.off-canvas-content-->
</div><!--/.off-canvas-wrapper-->
</body>
</html>
