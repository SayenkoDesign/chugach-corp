<div class="facet-form">
<?php
add_filter( 'facetwp_sort_options', function( $options, $params ) {
    $options['default']['label'] = 'Sort By';
    return $options;
}, 10, 2 );


add_filter( 'facetwp_sort_options', function( $options, $params ) {
    $options = [
		'default' => [
			'label' => __( 'Sort by', 'fwp' ),
			'query_args' => []
		],
		'title_asc' => [
			'label' => __( 'Title (A-Z)', 'fwp' ),
			'query_args' => [
				'orderby' => 'title',
				'order' => 'ASC',
			]
		],
		'title_desc' => [
			'label' => __( 'Title (Z-A)', 'fwp' ),
			'query_args' => [
				'orderby' => 'title',
				'order' => 'DESC',
			]
		],
		'date_desc' => [
			'label' => __( 'Date (Newest)', 'fwp' ),
			'query_args' => [
				'orderby' => 'meta_value_num',
            	'meta_key' => 'posted_date',
				'order' => 'DESC',
			]
		],
		'date_asc' => [
			'label' => __( 'Date (Oldest)', 'fwp' ),
			'query_args' => [
				'orderby' => 'meta_value_num',
            	'meta_key' => 'posted_date',
				'order' => 'ASC',
			]
		]
	];
    
    return $options;
}, 10, 2 );


echo facetwp_display( 'facet', 'job_keyword' );
echo facetwp_display( 'facet', 'job_company' );
// echo facetwp_display( 'facet', 'job_sort' );// 
echo facetwp_display( 'facet', 'job_location' );
echo facetwp_display( 'sort' );
?>
<button class="facetwp-search-button" onclick="FWP.refresh()">Submit</button>
<button class="facetwp-reset">Reset</button>
</div>