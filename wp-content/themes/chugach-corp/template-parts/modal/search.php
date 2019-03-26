<?php

/*
Modal - Search
*/

?>
<div class="modal-search reveal" id="modal-search" data-reveal data-close-on-click="true">
    <div class="modal-content">
        <div class="row align-middle align-center">
            <div class="small-12 columns">
                 <button class="close-button" data-close aria-label="Close modal" type="button">
                    <span aria-hidden="true">&times;</span>
                </button>
                <?php
                get_search_form();
                ?>
            </div>
        </div>
    </div>
   
</div>