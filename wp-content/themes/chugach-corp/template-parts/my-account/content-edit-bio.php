<?php

// Is there already a Familiy Post id for this user?
            
$post_id = get_family_post_by_user_id();
                        
$defaults = array(
    'post_id' => 'new_post',
    'field_groups' => array(618), // Same ID(s) used before
    'form' => true,
    'updated_message' => __("Bio updated", 'acf'),
    //'return' => '%post_url%',
    'submit_value' => 'Save Changes',
    'post_title' => false,
    'post_content' => false,
    'html_submit_button'	=> '<button class="acf-button button"><span>%s</span></button>',
	'html_submit_spinner'	=> '',
);

if ( $post_id ) {
    $acf_form_args['post_id'] = $post_id;
} else {
    $acf_form_args['new_post'] = array(
        'post_type'		=> 'family',
        'post_status'	=> 'publish'
    );
}
    
$acf_form_args = wp_parse_args($acf_form_args, $defaults );
                        
echo "<div class='acf-edit-post'>";
    acf_form ( $acf_form_args );
echo "</div>";

echo '</div>';