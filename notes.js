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
        
        // Register the plugin with MeshCentral
        obj.registerPlugin();
    };

    // Register plugin with MeshCentral UI
    obj.registerPlugin = function () {
        // Ajouter l'icône dans le menu de gauche de MeshCentral
        if (obj.parent.webserver) {
            obj.parent.webserver.pluginHandler = obj.parent.webserver.pluginHandler || {};
            obj.parent.webserver.pluginHandler.notes = obj;
        }
    };

    // Setup database collections
    obj.setupDatabase = function () {
        // Les notes seront stockées avec un identifiant unique
        // Format: note~{meshid}~{noteid} pour les notes liées à un device
        // Format: note~global~{noteid} pour les notes globales
    };

    // Hook pour ajouter l'icône dans l'interface
    obj.onWebUIRequest = function () {
        return {
            icon: 'fa fa-sticky-note',
            title: 'Notes',
            onclick: 'openNotesPanel()'
        };
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
            case 'getAllNotes':
                obj.getAllNotes(callback);
                break;
            case 'searchNotes':
                obj.searchNotes(data.query, callback);
                break;
            default:
                if (callback) callback('Unknown command');
        }
    };

    // Get all notes (global + device notes)
    obj.getAllNotes = function (callback) {
        obj.db.GetAllType('note', function (err, notes) {
            if (callback) callback(err, notes);
        });
    };

    // Hook pour les messages WebSocket
    obj.onDeviceMessage = function (ws, user, msg) {
        if (msg.action === 'plugin' && msg.plugin === 'notes') {
            obj.serveraction(msg.pluginaction, msg.data || msg, user, function (err, result) {
                if (err) {
                    try {
                        ws.send(JSON.stringify({ action: 'plugin', plugin: 'notes', error: err }));
                    } catch (ex) { }
                } else {
                    try {
                        ws.send(JSON.stringify({ 
                            action: 'plugin', 
                            plugin: 'notes', 
                            pluginaction: msg.pluginaction,
                            notes: result 
                        }));
                    } catch (ex) { }
                }
            });
        }
    };

    // Inject client-side script into web interface
    obj.onWebUIRequest = function () {
        return {
            icon: 'fa fa-sticky-note',
            title: 'Notes',
            onclick: 'openNotesPanel()'
        };
    };

    return obj;
};
