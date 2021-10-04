<?php
/*
Template Name: Careers V2
 */

add_filter('body_class', function ($classes) {
    unset($classes[array_search('page-template-default', $classes)]);
    $classes[] = 'template-careers';
    return $classes;
}, 99);

add_action('wp_footer', function () {
    ?>
    <script>
    (function($) {

      $(function() {
          if ('undefined' !== typeof FWP) {
              FWP.auto_refresh = false;
          }
      });

      $(document).on('facetwp-loaded', function() {
        if (FWP.loaded && FWP.is_reset == false ) {
          $('.results-wrapper').addClass('visible');
          $('.section-container').addClass('hide');
        }
        if (FWP.settings.pager.page === FWP.settings.pager.total_pages) {
            $('.facetwp-facet-load_more').remove();
        }

        

      });

      document.addEventListener('facetwp-loaded', function() {
        $.fn.matchHeight._update();
        $('.template-careers .careers-section .grid .column h3').matchHeight(true);
        $('.template-careers .careers-section .grid .column .company').matchHeight(true);
        $('.template-careers .careers-section .grid .column .location').matchHeight(true);
     });

      $(document).on('click', '.facetwp-reset', function() {
        FWP.reset();
        FWP.is_reset = true;
        $('.results-wrapper').removeClass('visible');
        $('.section-container').removeClass('hide');
      });

      $('.template-careers .careers-section .grid .column h3').matchHeight(true);
      $('.template-careers .careers-section .grid .column .company').matchHeight(true);
      $('.template-careers .careers-section .grid .column .location').matchHeight(true);

    })(jQuery);
    </script>
    <?php
}, 100);

get_header();?>

<?php
_s_get_template_part('template-parts/global', 'hero');
?>

<div id="primary" class="content-area">

	<main id="main" class="site-main" role="main">


  <section class="container careers-section">
    <div class="wrap">
      <div class="row column">

        <?php
        _s_get_template_part('template-parts/careers', 'job-search');

        _s_get_template_part( 'template-parts/careers', 'message' );
        ?>

                <div class="results-wrapper">
                  <span class="hide results-count">3 Results Found for: Chugach Alaska Corporation</span>

                  <div class="row small-up-1 medium-up-2 large-up-4 grid facetwp-template">
                  <?php

        $args = [
            'post_type' => 'job',
            'posts_per_page' => 12,
            'facetwp' => true, // we added this
        ];
        $loop = new WP_Query($args);

        if ($loop->have_posts()) {
            while ($loop->have_posts()) {
                $loop->the_post();
                _s_get_template_part('template-parts/careers', 'job-column');
            }            
        }
        ?>
          </div>

          <?php
          if( function_exists( 'facetwp_display' ) ) {
            echo facetwp_display( 'facet', 'load_more' );
          }

          wp_reset_postdata();
          //echo do_shortcode('[facetwp pager="true"]');
          ?>
        </div>
      </div>
    </div>
  </section>

  <div class="section-container">
    <?php
//echo do_shortcode( '[chugach_careers]' );
_s_get_template_part('template-parts/careers', 'introduction');
_s_get_template_part('template-parts/careers', 'why');
_s_get_template_part('template-parts/careers', 'shareholders');
_s_get_template_part('template-parts/careers', 'testimonials');
?>
  </div>

	</main>


</div>

<?php
get_footer();
