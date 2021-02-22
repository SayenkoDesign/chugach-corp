<?php

    // optional content
    $documents_heading = get_sub_field('documents_heading');
    $resources = get_sub_field('resources_group');

    // class & ID
    $section_class = 'pagebuilder-section pagebuilder-section-document-library';
    $section_id = '';
    if(get_sub_field('class')) { $section_class .= ' ' . get_sub_field('class'); }
    if(get_sub_field('id')) { $section_id = get_sub_field('id'); }

    $count = 0;
    while(have_rows('documents')) : the_row();
        $count++;
    endwhile;

    if($count > 4) {
        $section_class .= ' more-than-four';
    }

?>

<section
    id="<?php echo $section_id; ?>"
    class="<?php echo $section_class; ?>"
    >

    <div class="row">

        <?php if(get_sub_field('documents') && have_rows('documents')) : ?>

            <div class="documents-column column large-7">

                <?php if($documents_heading) : ?>
                    <h2 class="documents-heading section-heading element-heading"><?php echo $documents_heading; ?></h2>
                <?php endif; ?>

                <div class="documents">

                    <?php while(have_rows('documents')) : the_row(); ?>

                        <?php
                            $category = get_sub_field('category');
                            $title = get_sub_field('title');
                            $blurb = get_sub_field('blurb');
                            $link_text = get_sub_field('link_text');
                            $link_url = get_sub_field('link_url');
                        ?>

                        <div class="document">

                            <?php if($link_url) : ?>
                                <a
                                    href="<?php echo $link_url; ?>"
                                    class="document-inner document-link"
                                    <?php if(get_sub_field('is_link_download')) : ?>
                                        download
                                    <?php endif; ?>
                                    >

                                    <div class="pseudo-anchor"></div>

                                    <div class="document-content">

                                        <?php if($category) : ?>
                                            <h4 class="document-text document-category"><?php echo $category; ?></h4>
                                        <?php endif; ?>

                                        <?php if($title) : ?>
                                            <h3 class="document-text document-title"><?php echo $title; ?></h3>
                                        <?php endif; ?>

                                        <?php if($blurb) : ?>
                                            <p class="document-text document-blurb"><?php echo $blurb; ?></p>
                                        <?php endif; ?>

                                        <?php if($link_text && $link_url) : ?>
                                            <div class="document-link-text-wrapper">
                                                <p
                                                    class="document-text document-link-text"
                                                    ><?php echo $link_text ?></p>
                                                <span class="arrow"></span>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                </a>
                            <?php endif; ?>

                        </div>

                    <?php endwhile; ?>
                </div>
            </div>

        <?php endif; ?>

        <!-- <div class="resources column medium-4"> -->

            <?php _s_get_template_part( 'template-parts/pagebuilder/ultraflex', 'resources' ); ?>
        <!-- </div> -->

    </div>
</section>

