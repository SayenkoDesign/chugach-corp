<?php

    $menu_items = get_field('menu_items');

    $count_menu_items = count(get_field('menu_items'));
    $show_on_page_links = get_field('show_on_page_links');

?>

<?php if($show_on_page_links && $count_menu_items) : ?>

    <nav class="on-page-links" id="on-page-links">

        <div class="row on-page-links-container">

            <button
                class="menu-button on-page-mobile-nav-toggle"
                type="button"
                aria-label="Menu"
                aria-controls="navigation">
                Menu
                <!-- <span class="hamburger-box"> -->
                    <!-- <span class="hamburger-inner"></span> -->
                <!-- </span> -->
            </button>

            <ul class="on-page-links-list">

                <?php if(have_rows('menu_items')) : ?>

                    <?php while(have_rows('menu_items')) : the_row(); ?>

                        <?php if(get_sub_field('text') && get_sub_field('link_anchor')) : ?>

                            <?php
                                $link_anchor = get_sub_field('link_anchor');
                                if($link_anchor[0] != '#') {
                                    $link_anchor = '#' . $link_anchor;
                                }
                            ?>

                            <li class="on-page-links-item">

                                <a
                                    href="<?php echo $link_anchor; ?>"
                                    class="on-page-links-link">
                                    <?php echo get_sub_field('text') ?>
                                </a>
                            </li>

                        <?php endif; ?>

                    <?php endwhile; ?>

                <?php endif; ?>

            </ul>
        </div>

    </nav>

<?php endif; ?>
