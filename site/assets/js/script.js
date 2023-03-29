// JSON data
const data = {
	services: [
		{
			name: 'Service A',
			status: [
				{
					timestamp: '2023-03-29T10:30:00Z',
					response: 'Operational',
					response_id: 1,
					description: 'Service A is currently online with no issues.',
				},
				{
					timestamp: '2023-03-28T08:00:00Z',
					response: 'Major Outage',
					response_id: 2,
					description: 'Service A was offline due to scheduled maintenance.',
				},
				{
					timestamp: '2023-03-27T15:45:00Z',
					response: 'Partial Outage',
					response_id: 3,
					description: 'Service A is experiencing latency issues.',
				},
			],
		},
		{
			name: 'Service B',
			status: [
				{
					timestamp: '2023-03-29T10:30:00Z',
					response: 'Operational',
					response_id: 1,
					description: 'Service A is currently online with no issues.',
				},
				{
					timestamp: '2023-03-28T08:00:00Z',
					response: 'Major Outage',
					response_id: 2,
					description: 'Service A was offline due to scheduled maintenance.',
				},
				{
					timestamp: '2023-03-27T15:45:00Z',
					response: 'Partial Outage',
					response_id: 3,
					description: 'Service A is experiencing latency issues.',
				},
			],
		},
	],
};
// Function to create timeline bar element
function createTimelineBar(status, timestamp) {
	return `
	  <div class="timeline-bar timeline-bar-${status}">
		<span class="tooltip">${new Date(timestamp).toLocaleDateString()}</span>
	  </div>
	`;
}

// Process JSON data
data.services.forEach((service, index) => {
	const lastStatus = service.status[0].response_id;
	const status = ['operational', 'major-outage', 'partial-outage'][lastStatus - 1];

	const template = `
	  <article>
		<div class="status-card">
		  <h2>
			${service.name}
			<span class="arrow">&#x25bc;</span>
		  </h2>
		  <p>
			<span class="status-label status-label-${status}">${service.status[0].response}</span>
		  </p>
		  <div class="timeline">
			${service.status.map((statusObj) => createTimelineBar(['operational', 'major-outage', 'partial-outage'][statusObj.response_id - 1], statusObj.timestamp)).join('')}
		  </div>
		  <div class="incidents"></div>
		</div>
	  </article>
	`;

	const section = document.querySelector('section');
	section.insertAdjacentHTML('beforeend', template);
});

// Add click event listeners to handle the drop-down functionality
document.querySelectorAll('.status-card .arrow').forEach((arrow) => {
	arrow.addEventListener('click', function () {
		this.closest('.status-card').classList.toggle('open');
	});
});

// Add mouseover and mouseout event listeners for the tooltips
document.querySelectorAll('.timeline-bar').forEach(function (bar) {
	bar.addEventListener('mouseover', function () {
		const tooltip = bar.querySelector('.tooltip');
		tooltip.style.display = 'block';
	});

	bar.addEventListener('mouseout', function () {
		const tooltip = bar.querySelector('.tooltip');
		tooltip.style.display = 'none';
	});
});

