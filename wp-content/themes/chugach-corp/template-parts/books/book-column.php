<?php
/**
 * Project - Column
 */
?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	
	<?php
    $thumbnail = get_the_post_thumbnail( get_the_ID(), 'thumbnail-book' );
    $author = get_field( 'author' );
    
    $description = get_field( 'description' );
    if( ! empty( $description ) ) {
        $description = sprintf( '<div class="description">%s</div>', $description );
    }
    
    $price = get_field( 'price' );
    if( ! empty( $price ) ) {
        $price =  sprintf( '<div class="price">%s</div>', _s_format_string( money_format( '$%.2n', $price ) ) );
    }
                                                            
    printf( '<div class="thumbnail" data-equalizer-watch="thumbnail">%s%s</div><div class="panel" data-equalizer-watch="panel">%s%s%s</div>', 
            $thumbnail, 
            $description, 
            sprintf( '<h3>%s</h3>', get_the_title() ),
            _s_format_string( $author, 'p' ),
            $price
           );
    ?>
</article><!-- #post-## -->
