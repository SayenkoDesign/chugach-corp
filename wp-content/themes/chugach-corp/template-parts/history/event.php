

<article id="post-<?php the_ID(); ?>" <?php post_class( $alignment );?>>
    
        <?php
        $data_attributes = get_data_attributes( [
                'data-aos' => 'zoom-in', 
                'data-aos-anchor-placement' => 'top-center',
                'data-aos-delay' => 200
             ] );
        printf( '<div class="event-date" %s><span class="teardrop">%s</span></div>', $data_attributes, $event_date );
        ?>
        
        <?php
        $data_attributes = get_data_attributes( [
                'data-aos' => 'event-even' == $alignment ? 'fade-right' : 'fade-left', 
                'data-aos-anchor-placement' => 'top-center',
                'data-aos-delay' => 600,
             ] );
        ?>
    
        <div class="event" <?php echo $data_attributes;?>>
                    
            
            <div class="panel">
               
               <?php
               $background = '';
               $thumbnail = get_the_post_thumbnail_url( get_the_ID(), 'medium' );
               if( ! empty( $thumbnail ) ) {
                   $background = sprintf( 'style="background-image: url(%s);"', $thumbnail );
               }
               ?>
                <div class="thumbnail" <?php echo $background; ?>></div>
                        
                <div class="entry-content">
                
                    <header><?php the_title( '<h3>', '</h3>' );?></header>
                
                    <?php 
                    the_content(); 		
                    ?>
                    
                </div><!-- .entry-content -->
            
            </div>
                  
        </div>
    
    
</article><!-- #post-## -->
