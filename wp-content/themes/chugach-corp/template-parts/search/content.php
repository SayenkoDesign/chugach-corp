<?php
/**
 * Template part for displaying page content in page.php.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package _s
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<header class="entry-header">
        <?php
        $permalink = get_the_permalink();
        $target = '';
        
        if( 'people' == get_post_type() ) {
            $permalink = sprintf( '%s#post-%s', trailingslashit( get_permalink( 372 ) ), get_the_ID() );
        }
        
        if( 'region' == get_post_type() ) {
            $permalink = get_permalink(847);
        }
        
        if( 'history' == get_post_type() ) {
            $permalink = sprintf( '%s#post-%s', trailingslashit( get_permalink( 371 ) ), get_the_ID() );
        }
        
        printf( '<div class="entry-post-type hide-for-large"><span>%s</span></div>', strtoupper( get_post_type() ) );
        ?>
		<?php 
        printf( '<h2 class="entry-title"><a href="%s"%s>%s</a></h2>', $permalink, $target,  get_the_title() );
        ?>
        <?php
        printf( '<div class="entry-post-type show-for-large"><span>%s</span></div>', strtoupper( get_post_type() ) );
        ?>
	</header><!-- .entry-header -->	
    
    <div class="entry-content">
        <?php
        $search_results_description = get_field( 'search_results_description' );
        if( ! empty( $search_results_description ) ) {
            printf( '<div class="search-result-description">%s</div>', $search_results_description );
        }
        
        // Post Types: Page/Post/Service/Project/job 
        
        if( 'post' == get_post_type() ) {
            echo '<div class="entry-meta">';
            _s_posted_on( 'M d, Y' );
            echo '</div>';
        } elseif( 'service' == get_post_type() ) {
            
        } elseif( 'project' == get_post_type() ) {
            
        } elseif( 'job' == get_post_type() ) {
            
            echo '<ul class="no-bullet info" data-equalizer-watch="info">';
            $location = get_field( 'location' );
            $address_icon = sprintf( '<img src="%ssearch/address-icon.svg" />', trailingslashit( THEME_IMG ) );
            printf( '<li class="address">%s<span>%s</span></li>', $address_icon, $location );
            
            $closing_date = get_field( 'closing_date' );
            $date = new DateTime( $closing_date );
            $closing_icon = sprintf( '<img src="%ssearch/closing-icon.svg" />', trailingslashit( THEME_IMG ) );
            printf( '<li>%s<span>Closing %s</span></li>', $closing_icon, $date->format('F d, Y') );
            echo '</ul>';   
            
        }
        ?>
    </div>
    <footer class="entry-footer">
    <?php
    printf( '<p><a href="%s"%s class="link green">Read More</a></p>', $permalink, $target );
    ?>
    </footer>
</article><!-- #post-## -->
