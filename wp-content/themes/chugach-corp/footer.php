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

<footer class="site-footer" role="contentinfo" itemscope itemtype="https://schema.org/WPFooter">
    <div class="edge">
        <?php
        printf( '<img src="%sfooter/footer-edge-top.png" />', trailingslashit( THEME_IMG ) );
        ?>
    </div>
    <div class="wrap">
    
        <div class="row align-center footer-widgets">
        
            <?php
            
            if( is_active_sidebar( 'footer-1' ) ){
                printf( '<div class="%s column column-block">', 'small-order-2 large-order-1 small-12 medium-6 large-4' );
                dynamic_sidebar( 'footer-1' );
                echo '</div>';
            }
            
            
            printf( '<div class="%s column column-block">', 'small-order-3 large-order-2 small-12  medium-12 large-4' );
                $site_url = home_url();
                $logo = sprintf('<img src="%slogo.png" class="" />', trailingslashit( THEME_IMG ) );                    
                printf('<aside class="widget widget_media_image text-center"><a href="%s" title="%s">%s</a></aside>',
                        $site_url, get_bloginfo( 'name' ), $logo );
            echo '</div>';
            
            
            if( is_active_sidebar( 'footer-2' ) ){
                printf( '<div class="%s column column-block">', 'small-order-2 large-order-3 small-12  medium-6 large-4' );
                dynamic_sidebar( 'footer-2' );
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
            
                  
        $copyright = sprintf( '<p>&copy; %s Dream Reachers, a 501(c)(3) not-for-profit corporation. %s</p>', 
                                  date( 'Y' ), $menu );
        
        $designer  = sprintf( '<p>All rights reserved. <a href="%1$s" target="_blank">Seattle Web Design</a> by <a href="%1$s" target="_blank">Sayenko Design</a></p>', 'http://www.sayenkodesign.com' );
                                                    
        printf( '<div class="column row footer-copyright">%s%s</div>', $copyright, $designer );

        ?>
     </div>
 
 </footer><!-- #colophon -->

<?php 
 
wp_footer(); 
?>
</body>
</html>
