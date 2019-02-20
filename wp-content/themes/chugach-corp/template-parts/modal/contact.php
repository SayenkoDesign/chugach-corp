<?php

/*
Modal - Contact
		
*/

modal_contact();
function modal_contact() {
    
    $form_id = 2;
    $form = GFAPI::get_form( $form_id );
    
     ?>
    <div class="contact reveal" id="contact" data-reveal data-animation-in="hinge-in-from-middle-y fast" data-animation-out="hinge-out-from-middle-y fast">
 	<div class="modal-contact">
		<button class="close-button" data-close aria-label="Close modal" type="button">
		<span aria-hidden="true">&times;</span>
	    </button>
      
        <?php
        printf( '<div class="modal-title"><h4>%s</h4></div>', $form['title'] );
        
        if( !empty( $form['description'] ) ) {
          printf( '<div class="modal-description">%s', wpautop( $form['description'] ) );
        }
        ?>
      
        <div class="modal-form">
        <?php
        echo do_shortcode( sprintf( '[gravityform id="%s" title="false" description="false" ajax="true" tabindex="99"]', $form_id ) );
        ?>
      </div>
   </div>
</div>
<?php
       
}