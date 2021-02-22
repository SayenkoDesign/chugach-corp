<?php

    /**
     * Build categories array
     *  - make sure the repeater has a value in each row
     *  - make sure the category has posts
     */
    $categories = [];
    if(get_sub_field('categories')) :
        while(have_rows('categories')) : the_row();
            if(get_sub_field('category')) :
                $category_id = get_sub_field('category');
                if(get_term_by('id',$category_id,'faq-category')->count > 0) :
                    array_push($categories,$category_id);
                endif;
            endif;
        endwhile;
    endif;
    /* Return if no real categories */
    if(empty($categories)) { return; }

    $count_categories = count($categories);

    $faq_query = new WP_Query([
        'post_type' => 'faq',
        'orderby' => 'menu_order',
        'posts_per_page' => -1,
        'tax_query' => array(
            array(
                'taxonomy' => 'faq-category',
                'field' => 'id',
                'terms' => $categories,
            )
        ),
        'facetwp' => false,
    ]);

    /* Return if no real categories */
    if(!$faq_query->have_posts()) { return; }

    // class & ID
    $section_class = 'pagebuilder-section pagebuilder-section-frequently-asked-questions';
    $section_id = '';
    if(get_sub_field('class')) { $section_class .= ' ' . get_sub_field('class'); }
    if(get_sub_field('id')) { $section_id = get_sub_field('id'); }

?>

<section
    id="<?php echo $section_id; ?>"
    class="<?php echo $section_class; ?>"
    >

    <?php if(get_sub_field('section_heading')) : ?>
        <div class="row section-row">
            <div class="column">
                <h2 class="section-heading element-heading"><?php echo get_sub_field('section_heading'); ?></h2>
            </div>
        </div>
    <?php endif; ?>

    <?php if($count_categories > 1) : ?>
        <div class="faq-filters">
            <div class="row faq-filter-buttons">
                <button class="faq-filter-button active" data-filter="*">All</button>
                <?php foreach($categories as $category) :
                    $category = get_term($category,'faq-category');
                    echo '<button class="faq-filter-button" data-filter=".' . $category->slug . '">' . $category->name . '</button>';
                endforeach; ?>
            </div>
        </div>
    <?php endif; ?>

    <div class="row faqs-row">
        <ul class="faqs accordion column" data-accordion data-allow-all-closed="true">

            <?php while ( $faq_query->have_posts() ) :
                $faq_query->the_post();
                $post_id = get_the_ID();

                if(get_the_terms($post_id,'faq-category')) :
                    $terms = get_the_terms($post_id,'faq-category');
                    $terms_classes = '';
                    foreach($terms as $term) :
                        $terms_classes .= $term->slug;
                        $terms_classes .= ' ';
                    endforeach;
                endif;

                echo '<li class="faq accordion-item faq-shown ' . $terms_classes . '" data-accordion-item>';
                    echo '<a href="#" class="accordion-title">' . get_the_title() . '</a>';
                    echo '<div class="accordion-content" data-tab-content>';
                        the_content();
                    echo '</div>';
                echo '</li>';
            endwhile; ?>
        </ul>
    </div>

</section>

<?php wp_reset_postdata(); ?>
