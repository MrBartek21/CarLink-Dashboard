





function loadDirectory(path){
    fetch(`/files${path}`)
        .then(response => response.json())
        .then(data => {
            const fileList = document.getElementById('fileList');
            fileList.innerHTML = '';

            if (path !== '/') {
                const parentPath = path.split('/').slice(0, -1).join('/') || '/';
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item list-group-item-secondary';
                listItem.textContent = 'Go up..';
                listItem.style.cursor = 'pointer';
                listItem.addEventListener('click', () => {
                    loadDirectory(parentPath);
                });
                fileList.appendChild(listItem);
            }

            data.forEach(file => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item';
                listItem.textContent = file.name;

                if (file.isDirectory) {
                    listItem.style.fontWeight = 'bold';
                    listItem.style.cursor = 'pointer';
                    listItem.addEventListener('click', () => {
                        loadDirectory(file.path);
                    });
                }

                fileList.appendChild(listItem);
            });

            currentPath = path;
        })
        .catch(error => console.error('Error fetching files:', error));
}








