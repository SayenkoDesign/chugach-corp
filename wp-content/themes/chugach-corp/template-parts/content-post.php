<?php
/**
 * Template part for displaying single posts.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package _s
 */
?>
<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	
	<?php
    // Sldier?
    $rows = get_field( 'photo_slider' );
    
    if( ! empty( $rows ) ) {
        
        $slides = '';
        
        foreach( $rows as $key => $row ) {  
            $size = wp_is_mobile() ? 'large' : 'hero';
            $image = $row['ID'];  
            $image = _s_get_acf_image( $image, $size ); 
            $style = sprintf( ' style="background-image: url(%s);"', $image  );   
                        
            $caption = '';
            
            if( ! empty( wp_get_attachment_caption( $row['ID'] ) ) ) {
                $caption = sprintf( '<div class="slick-caption"><p>%s</p></div>', wp_get_attachment_caption( $row['ID'] ) );
            }
                                                                                                                             
            $slides .= sprintf( '<div class="slide">
                                    %s
                                    %s
                                </div>', 
                            $image, $caption
                         );
        }
                
        $arrows = '<div class="slick-arrows"></div>';
        
        printf( '<div class="slider"><div class="slick">%s</div>%s</div>', 
                                $slides, 
                                $arrows 
                      );
                      
        echo '<style>
        .slick-caption {
            padding: 10px 0;
            text-align: center;    
        }
        </style>';
    }
    
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
              
        ?>           
	</footer><!-- .entry-footer -->
    
</article><!-- #post-## -->
