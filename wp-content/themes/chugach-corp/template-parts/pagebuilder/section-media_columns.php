<?php


    // class & ID
    $section_class = 'pagebuilder-section pagebuilder-section-media-columns';
    $section_id = '';
    if(get_sub_field('class')) { $section_class .= ' ' . get_sub_field('class'); }
    if(get_sub_field('id')) { $section_id = get_sub_field('id'); }

    $count = count(get_sub_field('media_items'));
    $count_under_3 = true;
    if($count > 2) {
        $count_under_3 = false;
    }
    $sizes = "(min-width: 1200px) 400px, (min-width: 640px) 50vw, 100vw";
    if($count == 2) {
        $sizes = "(min-width: 640px) 600px, 100vw";
    }
    if($count == 1) {
        $sizes = "(min-width: 1200px) 1200px, 100vw";
    }

    if($data['section_count'] > 1) {
        if(get_sub_field('style') == 'light') { $section_class .= ' bg-light'; }
    }

?>

<section
    id="<?php echo $section_id; ?>"
    class="<?php echo $section_class; ?> <?php if($count_under_3) { echo 'under-three'; } ?>"
    >

    <div class="row">


        <?php if(get_sub_field('section_heading')) : ?>
                <h2 class="element-heading section-heading"><?php echo get_sub_field('section_heading'); ?></h2>
        <?php endif; ?>

        <div class="row columns-container">

            <?php while(have_rows('media_items')) : the_row(); ?>

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

                /* if you don't have an image ID at this point, something's gone wrong */
                if(!$image_id) { return; }

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
                $fallback_lqip_css = "{background-image:url('" . $srcset_lowest_url . "');}";

                /* generate random number class for the css rules */
                $unique_class = 'bg-fallback-' . uniqid();

                ?>

                <article class="media-item column small-12 medium-6 large-4">

                    <div class="image-container">

                        <a
                            class="element-image progressive replace"
                            data-srcset="<?php echo wp_get_attachment_image_srcset( $image['ID'], 'lqip'); ?>"
                            data-sizes="<?php echo $sizes; ?>"
                            href="<?php echo wp_get_attachment_image_url( $image['ID'], 'full'); ?>">
                            <img
                                class="preview"
                                src="<?php echo 'data: ' . get_post_mime_type($image['ID']) . ';base64,' . base64_encode(file_get_contents(strstr(wp_get_attachment_image_src(get_sub_field('image')['ID'], 'lqip' )[0],'wp-content'))); ?>"
                                alt="<?php echo $image['alt']; ?>">

                            <!-- the background-image div fallback -->
                            <!-- the inline styles to include the background images -->
                            <style class="background-image-fallback-style">
                                <?php echo "." . $unique_class . $fallback_full_css; ?>
                                <?php echo "." . $unique_class . ".replace" . $fallback_lqip_css; ?>
                            </style>

                            <!-- the div that displays them -->
                            <div
                                class="background-image-container background-image background-image-fallback progressive replace <?php echo $unique_class; ?>"
                                style="display: none;"
                                ></div>
                        </a>


                        <button
                            class="play-video"
                            data-open="modal-video"
                            data-src="<?php echo _s_get_video_embed( get_sub_field('video_url') ); ?>">
                            <?php echo get_svg('play-hero'); ?>
                            <span class="screen-reader-text">Watch Video</span>
                        </button>
                    </div>

                    <h3 class="image-title element-heading"><?php echo get_sub_field('heading'); ?></h3>

                </article>
            <?php endwhile; ?>

        </div>
    </div>
</section>

