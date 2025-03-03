const urlPrefix = 'http://localhost:5003';

function showLoading(document) {
    document.getElementById('loadingIndicator').style.display = 'flex';
}

function hideLoading(document) {
    document.getElementById('loadingIndicator').style.display = 'none';
}