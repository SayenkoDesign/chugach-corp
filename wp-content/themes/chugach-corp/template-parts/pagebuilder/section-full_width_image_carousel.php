<?php


    // class & ID
    $section_class = 'pagebuilder-section pagebuilder-section-full-width-image-carousel fs-full-width-image-carousel bg-img';
    $section_id = '';
    if(get_sub_field('class')) { $section_class .= ' ' . get_sub_field('class'); }
    if(get_sub_field('id')) { $section_id = get_sub_field('id'); }





?>

<section
    id="<?php echo $section_id; ?>"
    class="<?php echo $section_class; ?>"
    <?php if(get_sub_field('autoplay')) : ?>
        data-autoplay="true"
        <?php if(get_sub_field('autoplay_speed')) : ?>
            data-autoplay-speed="<?php echo get_sub_field('autoplay_speed'); ?>"
        <?php endif; ?>
    <?php endif; ?>
    >

    <div class="slick-container">

        <?php if(get_sub_field('section_heading')) : ?>
            <div class="row-outer">
                <div class="row">
                    <h2 class="section-heading"><?php echo get_sub_field('section_heading'); ?></h2>
                </div>
            </div>
        <?php endif; ?>

        <div class="slick">

        <?php while(have_rows('images')) : the_row(); ?>

            <?php
            /**
             * Image Handling
             */
            $image = get_sub_field('image');

            /* get individual vars if passed as array */
            if($image && gettype($image) == 'array') {
                if($image['id']) { $image_id = $image['id']; }
                if($image['alt']) { $image_alt = $image['alt']; }
            }

            /* get the srcset */
            $srcset = wp_get_attachment_image_srcset($image_id, $shape);

            /* split it once to get each image as a separate array entry */
            $srcset_split = explode(",",$srcset);

            /* split the array entries to separate URL from width */
            $srcset_split_again = array_map(function($val) {
                $val = ltrim($val," "); // trim space from beginning
                $val = rtrim($val,"w"); // trim 'w' from sizes val
                return explode(" ", $val); // return exploded array of url/width
            }, $srcset_split);

            /* Figure out what the largest under max-width and smallest images are */
            $srcset_highest_width = 0;
            $srcset_lowest_width = 999;
            foreach($srcset_split_again as $srcset) {
                $src_url = $srcset[0];
                $src_width = $srcset[1];
                if(!$srcset_highest_width || ($src_width > $srcset_highest_width && $src_width <= $max_width)) {
                    $srcset_highest_width = $src_width;
                    $srcset_highest_url = $src_url;
                }
                if(!$srcset_lowest_width || $src_width < $srcset_lowest_width) {
                    $srcset_lowest_width = $src_width;
                    $srcset_lowest_url = $src_url;
                }
            }

            /**
             * Generate background-image css rule fallbacks
             *   - for browsers that don't support object-fit
             *   - don't inline because it'd add weight for modern browsers
             */
            /* get the preview image as url (for fallback) and base64 (for inlining on modern browsers) */
            $preview_url = wp_get_attachment_image_url($image_id, $shape);
            // $preview_src = 'data:' . get_post_mime_type($image_id) . ';base64,' . base64_encode(file_get_contents($preview_url));

            /* generate css rules for background-image version */
            $fallback_full_css = "{background-image:url('" . $srcset_highest_url . "');}";

            /* generate random number class for the css rules */
            $unique_class = 'bg-fallback-' . uniqid();

            ?>

            <article class="image">

                <div class="image-container">

                    <div class="element-image">
                        <?php echo wp_get_attachment_image( get_sub_field('image')['ID'], $size = 'large' ); ?>

                        <!-- the background-image div fallback -->
                        <!-- the inline styles to include the background images -->
                        <style class="background-image-fallback-style">
                            <?php echo "." . $unique_class . $fallback_full_css; ?>
                        </style>

                        <!-- the div that displays them -->
                        <div
                            class="background-image-container background-image background-image-fallback progressive replace <?php echo $unique_class; ?>"
                            style="display: none;"
                            ></div>
                    </div>

                </div>

            </article>
        <?php endwhile; ?>
        </div>

        <div class="slick-navigation-container slick-arrows">
            <button type="button" class="slick-arrow slick-prev button-unstyle">
                <span class="sr-only">Previous</span>
            </button>
            <button type="button" class="slick-arrow slick-next button-unstyle">
                <span class="sr-only">Next</span>
            </button>
        </div>
    </div>
</section>

