<?php

    $column_class = 'content-area column';

    $content = get_sub_field('content_group');
    $heading = $content['heading'];
    $wysiwyg = $content['wysiwyg'];

    $button = $content['button'];
    if($button) :
        $button_link  = $button['link'];
        $button_style = $button['style'];
    endif;
    if($button_link) :
        $button_text  = $button_link['title'];
        $button_url   = $button_link['url'];
    endif;

    $content_elements = get_sub_field('content');
    if($content_elements == 'content') :
        // no extra classes
    elseif($content_elements == 'content-resources') :
        $column_class .= ' small-12 large-8';
    elseif($content_elements = 'content-image-resources') :
        $column_class .= ' small-12 large-6';
    endif;

?>

<div class="<?php echo $column_class; ?>">

    <div class="column-inner">

        <?php if($heading) : ?>
            <h2 class="section-heading element-heading"><?php echo $heading; ?></h2>
        <?php endif; ?>

        <?php if($wysiwyg) : ?>
            <div class="element-wysiwyg"><?php echo $wysiwyg; ?></div>
        <?php endif; ?>

        <?php if($button_text && $button_url) : ?>
            <a
                href="<?php echo $button_url; ?>"
                class="element-button button-unstyle <?php echo strtolower($button_style); ?>">
                <?php echo $button_text; ?></a>
        <?php endif; ?>
    </div>
</div>
