<?php

    /**
     * Notes:
     *   - content is always printed media, content, resources
     *     - that's the proper mobile order
     *     - desktop is figured out with flex order
     */

    $section_class = 'pagebuilder-section pagebuilder-section-ultraflex';
    $section_id = '';



    // content elements
    $content_elements = get_sub_field('content');

    // get the actual content groups
    $content = get_sub_field('content_group');
    $media = get_sub_field('media_group');
    $resources = get_sub_field('resources_group');

    // map the right fields to $layout and $style
    if($content_elements == 'content') :
        $layout = get_sub_field('content-layout');
        $style = get_sub_field('style');
    elseif($content_elements == 'content-image') :
        $layout = get_sub_field('content-image-layout');
        $style = get_sub_field('content-image-style');
    elseif($content_elements == 'content-resources') :
        $layout = get_sub_field('content-resources-layout');
        $style = get_sub_field('style');
    elseif($content_elements == 'content-image-resources') :
        $layout = get_sub_field('content-image-resources-layout');
        $style = get_sub_field('style');
    endif;

    // add classes
    $section_class .= ' elements-' . $content_elements;

    if($layout == 'narrow' || $layout == 'normal') :
        $section_class .= ' w-' . $layout;
    else :
        $section_class .= ' ' . $layout;
    endif;

    if($data['section_count'] > 1) {
        if($style == 'light') { $section_class .= ' bg-light'; }
    }
    if($style == 'red-boxed') { $section_class .= ' red-boxed'; }



    // custom class & ID
    if(get_sub_field('class')) { $section_class .= ' ' . get_sub_field('class'); }
    if(get_sub_field('id')) { $section_id = get_sub_field('id'); }

?>

<section
    id="<?php echo $section_id; ?>"
    class="<?php echo $section_class; ?>"
    data-aos="fade-in"
    data-aos-anchor-placement="center-bottom"
    >

    <div class="row">

        <div class="row-inner">

            <div class="column-container">

                <?php if($content_elements == 'content-image' || $content_elements == 'content-image-resources') :
                    _s_get_template_part( 'template-parts/pagebuilder/ultraflex', 'media' );
                endif; ?>

                <?php _s_get_template_part( 'template-parts/pagebuilder/ultraflex', 'content' ); ?>

                <?php if($content_elements == 'content-resources' || $content_elements == 'content-image-resources') :
                    _s_get_template_part( 'template-parts/pagebuilder/ultraflex', 'resources' );
                endif; ?>
            </div>
        </div>
    </div>
</section>

