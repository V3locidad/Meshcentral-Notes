/**
 * @description MeshCentral Notes Plugin
 * @author V3locidad
 * @license Apache-2.0
 */

module.exports.notes = function (parent) {
    var obj = {};
    obj.parent = parent;
    obj.meshServer = parent;
    obj.db = parent.db;
    obj.common = parent.common;

    // Plugin information
    obj.pluginName = 'MeshCentral Notes';
    obj.version = '1.0.0';

    // Initialize the plugin
    obj.start = function () {
        console.log('Starting Notes Plugin v' + obj.version);
        
        // Initialize database collections if needed
        obj.setupDatabase();
    };

    // Setup database collections
    obj.setupDatabase = function () {
        // Les notes seront stockées avec un identifiant unique
        // Format: note~{meshid}~{noteid} pour les notes liées à un device
        // Format: note~global~{noteid} pour les notes globales
    };

    // Create a new note
    obj.createNote = function (user, data, callback) {
        var note = {
            _id: 'note~' + (data.nodeid || 'global') + '~' + obj.common.zeroPad(Date.now(), 16),
            type: 'note',
            nodeid: data.nodeid || null, // null pour notes globales
            title: data.title,
            content: data.content,
            tags: data.tags || [],
            author: user._id,
            authorName: user.name,
            created: Date.now(),
            modified: Date.now(),
            modifiedBy: user._id,
            modifiedByName: user.name
        };

        obj.db.Set(note, function (err) {
            if (callback) callback(err, note);
        });
    };

    // Update an existing note
    obj.updateNote = function (user, noteId, data, callback) {
        obj.db.Get(noteId, function (err, notes) {
            if (err || !notes || notes.length === 0) {
                if (callback) callback('Note not found');
                return;
            }

            var note = notes[0];
            if (data.title) note.title = data.title;
            if (data.content) note.content = data.content;
            if (data.tags) note.tags = data.tags;
            note.modified = Date.now();
            note.modifiedBy = user._id;
            note.modifiedByName = user.name;

            obj.db.Set(note, function (err) {
                if (callback) callback(err, note);
            });
        });
    };

    // Delete a note
    obj.deleteNote = function (noteId, callback) {
        obj.db.Remove(noteId, function (err) {
            if (callback) callback(err);
        });
    };

    // Get notes for a specific node
    obj.getNodeNotes = function (nodeid, callback) {
        obj.db.GetAllTypeNodeFiltered(['note~' + nodeid], nodeid, 'note', function (err, notes) {
            if (callback) callback(err, notes);
        });
    };

    // Get all global notes
    obj.getGlobalNotes = function (callback) {
        obj.db.GetAllTypeNodeFiltered(['note~global'], 'global', 'note', function (err, notes) {
            if (callback) callback(err, notes);
        });
    };

    // Search notes
    obj.searchNotes = function (query, callback) {
        // Cette fonction pourrait être améliorée avec une recherche plus sophistiquée
        obj.db.GetAllType('note', function (err, notes) {
            if (err) {
                if (callback) callback(err);
                return;
            }

            var results = notes.filter(function (note) {
                var searchIn = (note.title + ' ' + note.content + ' ' + (note.tags || []).join(' ')).toLowerCase();
                return searchIn.indexOf(query.toLowerCase()) !== -1;
            });

            if (callback) callback(null, results);
        });
    };

    // Handle server actions
    obj.serveraction = function (command, data, user, callback) {
        switch (command) {
            case 'createNote':
                obj.createNote(user, data, callback);
                break;
            case 'updateNote':
                obj.updateNote(user, data.noteId, data, callback);
                break;
            case 'deleteNote':
                obj.deleteNote(data.noteId, callback);
                break;
            case 'getNodeNotes':
                obj.getNodeNotes(data.nodeid, callback);
                break;
            case 'getGlobalNotes':
                obj.getGlobalNotes(callback);
                break;
            case 'searchNotes':
                obj.searchNotes(data.query, callback);
                break;
            default:
                if (callback) callback('Unknown command');
        }
    };

    // Handle web server requests
    obj.handleRequest = function (req, res) {
        // Cette fonction gérera les requêtes HTTP pour l'interface web
        var url = require('url').parse(req.url, true);
        var path = url.pathname;

        if (path === '/notes') {
            // Servir l'interface principale
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(obj.getMainInterface());
        } else if (path === '/notes/api') {
            // API REST pour les opérations CRUD
            obj.handleApiRequest(req, res);
        }
    };

    // Generate main interface HTML
    obj.getMainInterface = function () {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>MeshCentral Notes</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        .note-controls {
            margin-bottom: 20px;
        }
        .btn {
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        .search-box {
            padding: 10px;
            width: 300px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .notes-list {
            margin-top: 20px;
        }
        .note-card {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .note-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .note-content {
            color: #666;
            margin-bottom: 10px;
        }
        .note-meta {
            font-size: 12px;
            color: #999;
        }
        .note-tags {
            margin-top: 10px;
        }
        .tag {
            display: inline-block;
            background-color: #e7f3ff;
            color: #007bff;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
            margin-right: 5px;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        }
        .modal-content {
            background-color: white;
            margin: 5% auto;
            padding: 20px;
            border-radius: 8px;
            width: 80%;
            max-width: 600px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        .form-group textarea {
            min-height: 150px;
            resize: vertical;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📝 Notes MeshCentral</h1>
        
        <div class="note-controls">
            <button class="btn" onclick="showCreateNoteModal()">+ Nouvelle Note</button>
            <input type="text" class="search-box" id="searchBox" placeholder="Rechercher..." onkeyup="searchNotes()">
        </div>

        <div class="notes-list" id="notesList">
            <!-- Les notes seront chargées ici -->
        </div>
    </div>

    <!-- Modal pour créer/éditer une note -->
    <div id="noteModal" class="modal">
        <div class="modal-content">
            <h2 id="modalTitle">Nouvelle Note</h2>
            <form id="noteForm">
                <div class="form-group">
                    <label>Titre</label>
                    <input type="text" id="noteTitle" required>
                </div>
                <div class="form-group">
                    <label>Contenu</label>
                    <textarea id="noteContent" required></textarea>
                </div>
                <div class="form-group">
                    <label>Tags (séparés par des virgules)</label>
                    <input type="text" id="noteTags" placeholder="urgent, réseau, maintenance">
                </div>
                <div class="form-group">
                    <button type="submit" class="btn">Enregistrer</button>
                    <button type="button" class="btn" onclick="closeModal()">Annuler</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function showCreateNoteModal() {
            document.getElementById('noteModal').style.display = 'block';
            document.getElementById('modalTitle').textContent = 'Nouvelle Note';
            document.getElementById('noteForm').reset();
        }

        function closeModal() {
            document.getElementById('noteModal').style.display = 'none';
        }

        function searchNotes() {
            var query = document.getElementById('searchBox').value;
            // TODO: Implémenter la recherche via API
            console.log('Recherche:', query);
        }

        document.getElementById('noteForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            var noteData = {
                title: document.getElementById('noteTitle').value,
                content: document.getElementById('noteContent').value,
                tags: document.getElementById('noteTags').value.split(',').map(t => t.trim()).filter(t => t)
            };

            // TODO: Envoyer via API
            console.log('Création note:', noteData);
            closeModal();
        });

        // Charger les notes au démarrage
        function loadNotes() {
            // TODO: Charger via API
            console.log('Chargement des notes...');
        }

        loadNotes();
    </script>
</body>
</html>
        `;
    };

    return obj;
};
