<?php

    $column_class = 'media-area column';

    $media = get_sub_field('media_group');
    $media_type = $media['media_type'];
    $video_url = $media['video_url'];
    $video_embed = _s_get_video_embed( $video_url );
    $image = $media['image'];
    $image_portrait = $media['image_portrait'];
    $image_overlay = $media['image_overlay'];

    if($media['image_overlay']) { $column_class .= ' has-overlay'; }



    $content_elements = get_sub_field('content');
    if($content_elements == 'content-image-resources') :
        $column_class .= ' small-12 large-3';
        $image = $image_portrait;
        $sizes = '(min-width: 980px) 260px, 100vw';
    else :
        $column_class .= ' small-12 large-6';
        $sizes = '(min-width: 1200px) 600px, (min-width: 980px) 50vw, 100vw';
    endif;


    /**
     * Image Handling
     */
    /* get individual vars if passed as array */
    if($image && gettype($image) == 'array') {
        if($image['id']) { $image_id = $image['id']; }
        if($image['alt']) { $image_alt = $image['alt']; }
    }

    /* if you don't have an image ID at this point, something's gone wrong */
    if(!$image_id) { return; }

    /* get the srcset */
    $srcset = wp_get_attachment_image_srcset($image_id);

    /* split it once to get each image as a separate array entry */
    $srcset_split = explode(",",$srcset);

    /* split the array entries to separate URL from width */
    $srcset_split_again = array_map(function($val) {
        $val = ltrim($val," "); // trim space from beginning
        $val = rtrim($val,"w"); // trim 'w' from sizes val
        return explode(" ", $val); // return exploded array of url/width
    }, $srcset_split);

    /* Figure out what the largest under max-width and smallest images are */
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

<div class="<?php echo $column_class; ?>">

    <div class="column-inner">

        <div class="image-wrapper">

            <a
                class="element-image progressive replace"
                data-srcset="<?php echo wp_get_attachment_image_srcset( $image['ID'], 'lqip'); ?>"
                data-sizes="<?php echo $sizes; ?>"
                href="<?php echo wp_get_attachment_image_url( $image['ID'], 'full'); ?>">
                <img
                    class="preview"
                    src="<?php echo 'data: ' . get_post_mime_type($image['ID']) . ';base64,' . base64_encode(file_get_contents(strstr(wp_get_attachment_image_src($image['ID'], 'lqip' )[0],'wp-content'))); ?>"
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


            <?php if($media_type == 'video') : ?>

                <button
                    class="play-video"
                    data-open="modal-video"
                    data-src="<?php echo $video_embed; ?>">
                    <?php echo get_svg('play-hero'); ?>
                    <span class="screen-reader-text">Watch Video</span>
                </button>

            <?php endif; ?>
        </div>
    </div>
</div>
