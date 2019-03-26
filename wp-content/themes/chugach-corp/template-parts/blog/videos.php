<?php
if( ! class_exists( 'Blog_Videos_Section' ) ) {
    class Blog_Videos_Section extends Element_Section {
        
        private $is_slick = false; // are we building a slider?
        
        public function __construct() {
            parent::__construct();
            
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
                     $this->get_name() . '-videos',
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
            
            $videos = $this->videos();
            
            if( empty( $videos ) ) {
                return false;   
            }
            
            return sprintf( '<header><h2>Media</h2></header>%s', $videos );
        }
        
        
        private function videos() {
            
            $cat = BlOG_VIDEO_CAT;           
            
            $args = array(
                'post_type' => 'post',
                'posts_per_page' => 20,
            );
            

            $tax_query[] = array(
                'taxonomy'         => 'category',
                'terms'            =>  [$cat],
                'field'            => 'term_id',   
                'operator'         => 'IN',
                'include_children' => false,
            );
            
            $args['tax_query'] = $tax_query;
            
            $loop = new WP_Query( $args );
            
            $found_posts = $loop->found_posts;
            
            /*
            Count videos
            
            < 4 show in grid
            
            < 8 show grid of two and the sidebar of more videos
            
            8++ show slider
            
            */
            
            $classes = '';
            
            if( $found_posts < 4 ) {
                $classes = ' small-up-1 medium-up-3';
            } elseif( $found_posts < 8 ) {
                
            } else {
                $this->is_slick = true;
            }

            $videos = [];
            $list = [];
            
            
            
            if ( $loop->have_posts() ) :                 
                          
                while ( $loop->have_posts() ) :
    
                    $loop->the_post(); 
                    
                    $current_post = $loop->current_post + 1;
                    
                    if( $found_posts < 4 ) {
                        $videos[] = $this->get_post();
                    } elseif( $found_posts < 8 ) {
                        if( $current_post < 3 ) {
                            $videos[] = $this->get_post();
                        } else {
                            $list[] = $this->get_post( false );   
                        }
                    } else {
                        
                        if( $current_post <= ( $found_posts - 5 ) ) {
                            $videos[] = $this->get_post();
                        } else {
                            $list[] = $this->get_post( false ); 
                        }
                    }
                        
                endwhile;
                
            endif; 
            
            wp_reset_postdata();
            
            // No videos?
            if( empty( $videos ) ) {
                return false;
            }            
            
            $out = '';
                        
            $videos = join( '', $videos );
                        
            if( $this->is_slick ) {
                $videos = sprintf( '<div class="column medium-8"><div class="slick">%s</div></div>', $videos );
            }
                        
            $out = sprintf( '<div class="row%s">%s%s</div>', $classes, $videos, $this->video_list( $list ) );  
                        
            return $out;
        }
        
        
        private function get_post( $full = true ) {
            
            if( ! $full ) {
                return sprintf( '<a href="%s">%s</a>', get_permalink(), get_the_title() );
            }
            
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
                        
            $column = sprintf( '<article><div class="background" %s>%s</div>%s</article>', $background, $play, $post_title );
            
            if( ! $this->is_slick ) {
                $column = sprintf( '<div class="column">%s</div>', $column );
            }
            
            return $column;
            
        } 
        
        private function video_list( $list ) {
            if( ! empty( $list ) ) {
                $view_all = sprintf( '<p><a href="%s" class="view-all">View all videos</a></p>', get_category_link( BlOG_VIDEO_CAT ) );
                return sprintf( '<div class="column small-12 medium-4"><div class="video-list">%s%s</div></div>', ul( $list ), $view_all );
            }
            
            return false;
        }
    }
}
   
new Blog_Videos_Section;
