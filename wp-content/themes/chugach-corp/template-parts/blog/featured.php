<?php
if( ! class_exists( 'Blog_Featured_Section' ) ) {
    class Blog_Featured_Section extends Element_Section {
                
        public function __construct() {
            parent::__construct();
            
            $fields = get_field( 'featured_posts', get_option('page_for_posts') );
            $this->set_fields( $fields );
            
            // Render the section
            if( empty( $this->render() ) ) {   
                return;
            }
                                    
            // print the section
            $this->print_element();        
        }
        
              
        // Add default attributes to section        
        protected function _add_render_attributes() {
            
            // use parent attributes
            parent::_add_render_attributes();
    
            $this->add_render_attribute(
                'wrapper', 'class', [
                     $this->get_name() . '-featured', 'images-loaded'
                ]
            ); 
            
            $this->add_render_attribute(
                'wrapper', 'id', [
                     $this->get_name() . '-videos',
                ],
                true
            ); 
                        
        }  
        
        
        
        // Add content
        public function render() {
            
            $video = $this->video(9);

			$media = $this->media();
            
            return sprintf( '<div class="row large-unstack">%s%s</div>', $video, $media );
        }
        
        
        private function video( $cat ) {

			$post_id = $this->get_fields( 'featured_video' );
                                    
            $args = array(
                
				'post_type' => 'post',
				'order' => 'DESC',
                'posts_per_page' => 1,
                'no_found_rows' => true,
                'update_post_meta_cache' => false,
                'update_post_term_cache' => false,
                'fields' => 'ids',				
            );

			if( ! empty( $post_id ) ) {
                $args['p'] = $post_id ;
            } else {
				$args['cat'] = $cat; 
			}

			$video = '';
            
            $loop = new WP_Query( $args );
                        
            if ( $loop->have_posts() ) :                 
                          
                while ( $loop->have_posts() ) :
    
                    $loop->the_post(); 
                    
                    $video = $this->get_video_post();
                        
                endwhile;
                
            endif; 
            
            wp_reset_postdata();
            
            // No videos?
            if( empty( $video ) ) {
                return false;
            }            
            
            return sprintf( '<div class="column large-4 column-block"><header><h2>Videos</h2><span class="view-all"><a href="%s">View All ></a></span></header>%s</div>', get_category_link( $cat ), $video );  
                        
        }
        
        
        private function get_video_post() {
            
            $icon = get_svg( 'play-video' );
            $permalink = get_permalink();
            $video_embed_url = get_post_meta( get_the_ID(), '_video_embed_url', true );
            if( ! empty( $video_embed_url ) ) {
                $play = sprintf( '<button class="play-video" data-open="modal-video" data-src="%s" tabindex="-1">%s</button>', $video_embed_url, $icon );
            } else {
                $play = sprintf( '<a href="%s" class="play-video">%s</a>', $permalink, $icon );
            }
            
            $background = '';
            $thumbnail = get_the_post_thumbnail_url( get_the_ID(), 'medium' );
            if( ! empty( $thumbnail ) ) {
                $background = sprintf( ' style="background-image: url(%s);"', $thumbnail ); 
            }
            
            $post_title = sprintf( '<h3><a href="%s">%s</a></h3>', $permalink, get_the_title() );
            
			$classes = get_post_class( 'video-post', get_the_ID() );

            $column = sprintf( '<article class="%s"><div class="background" %s>%s</div>%s</article>', 
								esc_attr( implode( ' ', $classes ) ), 
								$background, 
								$play, 
								$post_title 
							);
            
            return $column;
            
        } 


		private function media() {

			$post_id = $this->get_fields( 'featured_post' );
			$cat = $this->get_fields( 'featured_category' );
            
            $args = array(
                'post_type' => 'post',
                'order' => 'DESC',
                'posts_per_page' => 1,
                'no_found_rows' => true,
                'update_post_meta_cache' => false,
                'update_post_term_cache' => false,
                'fields' => 'ids',
				
            );

			if( ! empty( $post_id ) ) {
                $args['p'] = $post_id ;
            } else {
				$args['cat'] = $cat; 
			}


			$_post = '';
            
            $loop = new WP_Query( $args );
                        
            if ( $loop->have_posts() ) :                 
                          
                while ( $loop->have_posts() ) :
    
                    $loop->the_post(); 
                    
                    $_post = $this->get_post();
                        
                endwhile;
                
            endif; 
            
            wp_reset_postdata();
            
            if( empty( $_post ) ) {
                return false;
            }            
            
            return sprintf( '<div class="column large-8"><header><h2>%s</h2><span class="view-all"><a href="%s">View All ></a></span></header>%s</div>', get_cat_name( $cat ), get_category_link( $cat ), $_post );  
                        
        }
        

		private function get_post() {
            
            $permalink = get_permalink();
            
            $background = '';
            $thumbnail = get_the_post_thumbnail( get_the_ID(), 'medium' );
            
            $post_title = sprintf( '<h3><a href="%s">%s</a></h3>', $permalink, get_the_title() );
            
			$classes = get_post_class( '', get_the_ID() );

            $column = sprintf( '<article class="%s">
									<div class="row large-unstack">
										<div class="column"><a href="%s" class="thumbnail">%s</a></div>
										<div class="column"><div class="excerpt">%s%s</div></div>
									</div>
								</article>', 
								esc_attr( implode( ' ', $classes ) ),	
								$permalink,				
								$thumbnail, 
								$post_title, 
								wpautop( get_the_excerpt() ) 
							);
                        
            return $column;
            
        } 

    }
}
   
new Blog_Featured_Section;
