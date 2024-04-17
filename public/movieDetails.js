function showAllReviews(type, numReviews) {
    for (let i = 3; i < numReviews; i++) {
        let reviewElement = document.getElementById(`${type}-review-${i}`);
        if (reviewElement) {
            reviewElement.classList.remove('d-none');
        }
    }
    event.target.style.display = 'none';
}

    document.addEventListener('click', function(event) {
        if (event.target.matches('.read-more')) {
            let review = event.target.closest('.blockquote');
            let shortText = review.querySelector('.short-text');
            let fullText = review.querySelector('.full-text');
            shortText.classList.toggle('d-none');
            fullText.classList.toggle('d-none');
            event.target.textContent = event.target.textContent === 'Read More' ? 'Read Less' : 'Read More';
        }
    });