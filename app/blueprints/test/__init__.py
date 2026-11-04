from flask import Blueprint, request, jsonify

bp = Blueprint('test', __name__)


@bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok'}), 200