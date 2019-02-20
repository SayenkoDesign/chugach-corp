<?php

$regions = array(
    __( 'Region', CPT_Location::TEXTDOMAIN ), // Singular
    __( 'Regions', CPT_Location::TEXTDOMAIN ), // Plural
    'region' // Registered name
);

register_via_taxonomy_core( $regions, 
	array(
		'public' => true,
        'rewrite' => false,
	), 
	array( 'location', 'project', 'people', 'job', 'client' ) 
);