<?php

/*
Modal - Contact
		
*/

modal_story();
function modal_story() {
    
    $form_id = 2;
    $form = GFAPI::get_form( $form_id );
    
     ?>
    <div class="modal-story reveal" id="share-your-chugach-story" data-reveal data-deep-link="true" data-animation-in="hinge-in-from-middle-y fast" data-animation-out="hinge-out-from-middle-y fast">
 	<div class="wrap">
		<button class="close-button" data-close aria-label="Close modal" type="button">
		<span aria-hidden="true">&times;</span>
	    </button>
        <?php
        printf( '<div class="modal-title"><h2>%s</h2></div>', $form['title'] );
        ?>
      
        <div class="modal-body">
        <?php
        if( !empty( $form['description'] ) ) {
          printf( '<div class="modal-description">%s', wpautop( $form['description'] ) );
        }
        
        echo do_shortcode( sprintf( '[gravityform id="%s" title="false" description="false" ajax="true" tabindex="99"]', $form_id ) );
        ?>
      </div>
   </div>
</div>
<?php
       
}