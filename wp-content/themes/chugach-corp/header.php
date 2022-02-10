<?php
/**
 * The header for our theme.
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package _s
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js">
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="profile" href="http://gmpg.org/xfn/11">
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="apple-touch-icon" sizes="180x180" href="<?php echo THEME_FAVICONS;?>/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="<?php echo THEME_FAVICONS;?>/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="<?php echo THEME_FAVICONS;?>/favicon-16x16.png">
<link rel="manifest" href="<?php echo THEME_FAVICONS;?>/site.webmanifest">
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#046a38">
<meta name="msapplication-TileColor" content="#046a38">
<meta name="theme-color" content="#ffffff">

<script src="https://unpkg.com/scrollreveal/dist/scrollreveal.min.js"></script>
<?php wp_head(); ?>
</head>

<?php
$notification_bar = _s_get_template_part( 'template-parts/global', 'notification-bar', [], true );
?>

<body <?php body_class(); ?>>

    <?php
    $search_button = sprintf('<button class="search-button" data-open="modal-search"><img src="%sheader/search-mobile.svg" class="" /><span class="screen-reader-text">Search</span></button>', trailingslashit( THEME_IMG ) );
    ?>

    <div class="off-canvas-wrapper">
    <div class="off-canvas position-right" id="offCanvas" data-off-canvas data-content-scroll="false" aria-hidden="true">
        <button class="close-button" aria-label="Close menu" type="button" data-close></button>
        <?php
        echo $search_button;
        ?>
        <nav>
        <?php
        
        $args = array(
            'theme_location' => 'secondary',
            'menu' => 'Secondary Menu',
            'container' => '',
            'container_class' => '',
            'container_id' => '',
            'menu_id'        => 'secondary-menu',
            'menu_class'     => 'menu',
            'before' => '',
            'after' => '',
            'link_before' => '',
            'link_after' => '',
            'items_wrap' => '<ul id="%1$s" class="%2$s">%3$s</ul>'
         );
        wp_nav_menu($args);
        ?>
        </nav>
            
    </div>  

    <ul class="skip-link screen-reader-text">
        <li><a href="#content" class="screen-reader-shortcut"><?php esc_html_e( 'Skip to content', '_s' ); ?></a></li>
        <li><a href="#footer" class="screen-reader-shortcut"><?php esc_html_e( 'Skip to footer', '_s' ); ?></a></li>
    </ul>

    <?php
    //if( ! is_user_logged_in() ) {
        echo $notification_bar;
   // }
    ?>
    
    <div class="header-before show-for-xlarge">
        <div class="row">
            <div class="column">
                <?php
                echo _s_get_social_icons();
                ?>
            </div>
            <div class="column shrink">
                <nav class="nav-secondary">
                <?php
                function add_search_button( $items, $args ) {
                    if ( 'secondary' === $args->theme_location ) {
                            $button = sprintf('<button class="search-button" data-open="modal-search"><span><img src="%sheader/search.svg" class="" /></span><span class="screen-reader-text">Search</span></button>', trailingslashit( THEME_IMG ) );
                            $items .= sprintf( '<li class="menu-item">%s</li>', $button );
                    }
                    return $items;
                }
                add_filter( 'wp_nav_menu_items', 'add_search_button', 10, 2 );
                
                $args = array(
                    'theme_location' => 'secondary',
                    'menu' => 'Secondary Menu',
                    'container' => '',
                    'container_class' => '',
                    'container_id' => '',
                    'menu_id'        => 'secondary-menu',
                    'menu_class'     => 'menu',
                    'before' => '',
                    'after' => '',
                    'link_before' => '',
                    'link_after' => '',
                    'items_wrap' => '<ul id="%1$s" class="%2$s">%3$s</ul>'
                 );
                wp_nav_menu($args);
                remove_filter( 'wp_nav_menu_items', 'add_search_button', 10, 2 );
                ?>
                </nav>
            </div>
        </div>
    </div>
    
    <div class="sticky-header">
        <header id="masthead" class="site-header" role="banner" itemscope itemtype="https://schema.org/WPHeader">
            <div class="wrap">
                        
                <div class="row xlarge-unstack">
                    
                    <?php
                    printf('<button class="search-button search-button-mobile hide-for-xlarge" data-open="modal-search"><img src="%sheader/search-mobile.svg" class="" /><span class="screen-reader-text">Search</span></button>', trailingslashit( THEME_IMG ) );
                    ?>
                          
                    <div class="columns site-branding shrink">
                        <div class="site-title">
                        <?php
                        $site_url = home_url();
                        $logo_mobile = sprintf('<img src="%sheader/logo-mobile.png" alt="site logo" class="hide-for-xlarge" />', trailingslashit( THEME_IMG ) );  
                        $logo = sprintf('<img src="%sheader/logo.svg" alt="site logo" class="show-for-xlarge" />', trailingslashit( THEME_IMG ) );    
                        printf('<a href="%s" title="%s">%s%s</a>',
                                $site_url, 
                                get_bloginfo( 'name' ), 
                                $logo_mobile,
                                $logo );
                        ?>
                        </div>
                    </div><!-- .site-branding -->
                    
                    <nav id="site-navigation" class="nav-primary column" role="navigation" aria-label="Main" itemscope itemtype="https://schema.org/SiteNavigationElement">            
                        
                        <?php
                        
                            $args = array(
                                'theme_location' => 'mobile-cta',
                                'container' => '',
                                'container_class' => '',
                                'container_id' => '',
                                'menu_class'     => 'menu menu-cta hide-for-xlarge',
                                'before' => '',
                                'after' => '',
                                'link_before' => '',
                                'link_after' => '',
                                'items_wrap' => '<ul id="%1$s" class="%2$s">%3$s</ul>'
                             );
                            wp_nav_menu($args);
                            
                            // Desktop Menu
                            $args = array(
                                'theme_location' => 'primary',
                                'menu' => 'Primary Menu',
                                'container' => '',
                                'container_class' => '',
                                'container_id' => '',
                                'menu_id'        => 'primary-menu',
                                'menu_class'     => 'menu js-superfish',
                                'before' => '',
                                'after' => '',
                                'link_before' => '',
                                'link_after' => '',
                                'items_wrap' => '<ul id="%1$s" class="%2$s">%3$s</ul>'
                             );
                            wp_nav_menu($args);
                        ?>
                        
                    </nav>
                                        
                    <button type="button" class="secondary-menu-button" data-toggle="offCanvas" aria-hidden="true">
                        <?php printf( '<img src="%smenu-icon.svg" />', trailingslashit( THEME_IMG ) );?>
                        <span>Menu</span>
                    </button>
                                        
                </div>
    
                
                
            </div><!-- wrap -->
             
        </header><!-- #masthead -->
    </div>
    
    <div class="off-canvas-content" data-off-canvas-content>

    <div id="page" class="site-container">
        
        <div id="content" class="site-content">