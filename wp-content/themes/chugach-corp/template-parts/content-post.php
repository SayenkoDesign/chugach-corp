<?php
/**
 * Template part for displaying single posts.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package _s
 */
?>

<?php
$post_author = _s_get_post_author();
$post_author_class = $post_author ? 'has-post-author' : '';
?>

<article id="post-<?php the_ID(); ?>" <?php post_class( $post_author_class ); ?>>
	
	<?php
    echo $post_author;
    
    
    $intro = get_field( 'introduction' );
    
    if( ! empty( $intro ) ) {
        $intro = preg_replace( '~(?<=^<p>)(\W*)(\w)(?=[\s\S]*</p>$)~i',
                       '$1<span class="first-letter">$2</span>',
                       $intro );
        printf( '<div class="intro">%s</div>', $intro );
    }
    ?>
    
    
    <div class="entry-content">
	
		<?php 
		the_content(); 		
		?>
		
	</div><!-- .entry-content -->

	<footer class="entry-footer">
        <?php
        $previous = sprintf( '<span>%s</span>',  __( 'Previous Post', '_s') );
                    
        $next = sprintf( '<span>%s</span>',  __( 'Next Post', '_s') );
        
        $navigation = _s_get_the_post_navigation( array( 'prev_text' => $previous, 'next_text' => $next ) );
        
        printf( '<h3><span>%s</span></h3><div class="wrap text-center">%s%s</div>', 
                __( 'Share This', '_s' ),
                _s_get_addtoany_share_icons(),
                $navigation  
              );
              
        $form_id = 7;
        $form = GFAPI::get_form( $form_id );
        
        if( false !== $form ) {
           printf( '<div class="form-wrapper"><h4>SIGN UP FOR EMAIL UPDATES</h4>%s</div>', 
                    do_shortcode( sprintf( '[gravityform id="%s" title="false" description="false" ajax="true"]', $form_id ) ) );
        }
            
        ?>           
	</footer><!-- .entry-footer -->
    
</article><!-- #post-## -->
