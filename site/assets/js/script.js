			// Add a click event listener to handle the drop-down functionality
			document.querySelectorAll('.status-card').forEach(function (card) {
				card.querySelector('.arrow').addEventListener('click', function () {
					card.classList.toggle('open');
				});
			});

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

