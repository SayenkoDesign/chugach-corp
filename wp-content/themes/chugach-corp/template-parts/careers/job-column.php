<?php
$city = get_field( 'city' );
$state_code = get_field( 'state_code' );
$country = get_field( 'country' );

$posted_date = get_field( 'posted_date' );
$date_format = new DateTime( $posted_date );
$date = $date_format->format('n/d/Y');

?>
<div class="column">
	<a href="<?php the_field( 'apply_url' );?>" target="_blank">
	<?php the_title( '<h3>', '</h3>' );?>
	<span class="company"><?php the_field( 'company_name' );?></span>
	<span class="location"><?php printf( '%s, %s, %s', $city, $state_code, $country);?></span>
	<span class="date"><?php echo $date;?></span>
	<!-- <span class="closingDate">Ongoing</span> -->
	</a>
</div>