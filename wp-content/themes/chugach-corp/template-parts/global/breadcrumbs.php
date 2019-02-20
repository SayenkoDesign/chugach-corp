<?php
// Yoast Breadcrumbs
if ( function_exists('yoast_breadcrumb') ) {
    echo '<div class="column row show-for-large">';
    yoast_breadcrumb( '<div id="breadcrumbs" class="text-right">','</div>' );
    echo '</div>';
}
