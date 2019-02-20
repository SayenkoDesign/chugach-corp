<?php
/**
 * Template part for displaying page content in page.php.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package _s
 */
?>
<section class="section-founder">
    <article id="post-<?php the_ID(); ?>" <?php post_class( 'row' ); ?>>
        <?php
        $fields = get_field( 'founder_notes' );
        $heading = empty( $fields['heading'] ) ? '' : _s_format_string( $fields['heading'], 'h2' );
        $name = empty( $fields['name'] ) ? '' : _s_format_string( $fields['name'], 'h6' );
        $linkedin = empty( $fields['linkedin'] ) ? '' : sprintf( '<div class="icon"><a href="%s" title="view linkedin profile">%s</a></div>', 
                                                                $fields['linkedin'], _s_get_svg( 'linkedin' ) );
        $photo = empty( $fields['photo'] ) ? '' : _s_get_acf_image( $fields['photo'], 'large' );
        $introduction = empty( $fields['introduction'] ) ? '' : sprintf( '<div class="introduction">%s</div>', _s_format_string( $fields['introduction'], 'p' ) );
        ?>
        
        <div class="column column-block small-12 medium-4 large-5">
            <?php
            if( ! empty( $photo ) ) {
                $blue_rectangle = sprintf( '<div class="rectangle blue-rectangle"><img src="%sabout/blue-rectangle.svg" /></div>', trailingslashit( THEME_IMG ) );
                $orange_rectangle = sprintf( '<div class="rectangle orange-rectangle"><img src="%sabout/yellow-rectangle.svg" /></div>', trailingslashit( THEME_IMG ) );
                printf( '<div class="photo">%s%s%s</div>', $photo, $blue_rectangle, $orange_rectangle );
            }
            ?>
        </div>
        
        <div class="column small-12 medium-8 large-7">
            <header class="entry-header">
                <?php 
                echo $heading;
                echo $name;
                echo $linkedin;
                ?>
            </header><!-- .entry-header -->
            
            <?php
            echo $introduction;
            ?>
        
            <div class="entry-content">
                <?php
                    global $post;
                    $content_arr = get_extended ( $post->post_content );
                    
                    if( ! empty( $content_arr['extended'] ) ) {
                        
                        printf( '%s<div id="target">%s</div><p><button type="button" data-a11y-toggle="target" data-a11y-toggle-more="read more" data-a11y-toggle-less="read less" class="read-more">Read more</button></p>', 
                                apply_filters( 'the_content', $content_arr['main'] ),
                                apply_filters( 'the_content', $content_arr['extended'] )
                        );
                        
                    } else {
                        the_content();   
                    }
                ?>		
            </div><!-- .entry-content -->
        </div>
        
    </article><!-- #post-## -->
</section>