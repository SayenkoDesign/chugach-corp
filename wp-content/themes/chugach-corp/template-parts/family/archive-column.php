<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	
	<?php
    $family_name = _s_get_family_name();
    $bio = _s_get_family_bio( true );
    $thumbnail =_s_get_family_photo();
    $progress_bar = _s_get_family_progress_bar();
                                                            
    printf( '<a class="panel" href="%s">%s<div class="details" data-equalizer-watch="panel">%s%s</div><div class="still-needed">%s</div></a>', 
            get_the_permalink(),
            $thumbnail, 
            sprintf( '<h3>%s</h3>', $family_name ),
            $bio,
            $progress_bar
           );
    ?>
</article><!-- #post-## -->
