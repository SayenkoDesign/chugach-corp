<?php


    // class & ID
    $section_class = 'pagebuilder-section pagebuilder-section-steps';
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

    <div class="row">

        <?php if(get_sub_field('section_heading')) : ?>
            <h2 class="section-heading element-heading"><?php echo get_sub_field('section_heading'); ?></h2>
        <?php endif; ?>

        <div class="slick-container">

            <div class="slick">

                <?php $row_count = 0 ?>
                <?php while(have_rows('steps')) : the_row(); ?>
                    <?php $row_count++ ?>

                    <div class="step">

                        <div class="step-counter-outer">
                            <div class="step-counter">Step <?php echo $row_count; ?></div>
                        </div>

                        <div class="step-content">
                            <h3 class="step-heading"><?php echo get_sub_field('step_heading')?></h3>

                            <div class="step-text"><?php echo get_sub_field('step_text'); ?></div>


                            <?php while(have_rows('links')) : the_row(); ?>
                                <a
                                    href="<?php echo get_sub_field('link_url'); ?>"
                                    class="step-link"
                                    <?php if(get_sub_field('link_type') == 'download') { echo 'download'; } ?>
                                    ><?php echo get_sub_field('link_text'); ?></a>
                            <?php endwhile; ?>
                        </div>


                    </div>
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
    </div>

</section>

