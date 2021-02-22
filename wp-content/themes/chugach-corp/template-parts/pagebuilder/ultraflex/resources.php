<?php

    // $resources = $resources['resources'];

    $column_class = 'resources column';

    $resources_group = get_sub_field('resources');


    // $content_elements = get_sub_field('content');
    $column_class .= ' small-12 large-3';
    // if($content_elements == 'content-image-resources') :
        // $column_class .= ' small-12 medium-3';
    // else :
        // $column_class .= ' small-12 medium-6';
    // endif;

?>

<?php if(get_sub_field('resources_group') && have_rows('resources_group')) : ?>

    <?php while(have_rows('resources_group')) : the_row(); ?>

        <?php
            $section_heading = 'Resources';
            if(get_sub_field('heading')) {
                $section_heading = get_sub_field('heading');
            }
        ?>

        <?php if(get_sub_field('resources') && have_rows('resources')) : ?>

            <div class="<?php echo $column_class; ?>">

                <ul class="column-inner resources-accordion accordion" data-accordion data-allow-all-closed="true">


                    <li class="resources-accordion-item accordion-item is-active" data-accordion-item>
                        <a href="#" class="resources-accordion-title accordion-title"><h2 class="element-heading section-heading"><?php echo $section_heading; ?></h2></a>

                        <div class="resources-accordion-content accordion-content resources-container" data-tab-content>

                            <div class="resources-accordion-content-inner">

                                <?php while(have_rows('resources')) : the_row(); ?>

                                    <?php if(get_sub_field('title') && get_sub_field('link')['url']) : ?>

                                        <article class="resource">
                                            <a href="<?php echo get_sub_field('link')['url'] ?>">
                                                <h3 class="resource-title"><?php echo get_sub_field('title') ?></h3>
                                                <?php if(get_sub_field('blurb')) : ?>
                                                <p class="resource-blurb"><?php echo get_sub_field('blurb') ?></p>
                                                <?php endif; ?>
                                            </a>
                                        </article>
                                    <?php endif; ?>
                                <?php endwhile; ?>
                            </div>
                        </div>
                    </li>

                </ul>

            </div>
        <?php endif; ?>
    <?php endwhile; ?>
<?php endif; ?>
