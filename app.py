from flask import Flask, render_template, request, jsonify
from Knapsack import ShipmentAllocator
from TSP import BestRoute

app = Flask(__name__)

# Longitude and latitude lines for the cities
CITIES_COORDINATES = {
    "Damascus": (36.276, 33.513),
    "Aleppo": (37.159, 37.161),
    "Homs": (36.717, 34.733),
    "Latakia": (35.788, 35.529),
    "Hama": (36.733, 35.133),
    "Deir ez-Zor": (40.128, 32.507),
    "As-Suwayda": (36.703, 32.633),
    "Tartus": (35.883, 34.895),
    "Idlib": (36.883, 35.884),
    'Daraa': (36.1025, 32.6253)
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/planes_page')
def planes():
    return render_template('planes.html')

@app.route('/shipment_page')
def shipment():
    return render_template('shipment.html')

shipments = []
best_solution_global = None
unallocated_shipments_global = None

@app.route('/get_plane', methods=['POST'])
def get_plane():
    global planes
    planes = request.get_json()
    if not planes or len(planes) == 0:
        return jsonify({'success': False, 'error': 'No planes data received'}), 400
    print("Received planes data:", planes)
    return jsonify({'success': True, 'message': 'Planes data received successfully'}), 200

@app.route('/shipment_page', methods=['POST'])
def process_shipments():
    global shipments, planes
    try:
        shipments_data = request.get_json()
        if not shipments_data or 'shipments' not in shipments_data:
            return jsonify({'success': False, 'error': 'Invalid or missing shipments data'}), 400
        print("Received shipments data:", shipments_data)
        shipments = shipments_data['shipments']

        # Dictionary for add each plane its shipments' cities
        cities = {}

        allocator = ShipmentAllocator(shipments, planes)
        best_solution, unallocated_shipments = allocator.genetic_algorithm(pop_size=10, generations=50, mutation_rate=0.1)

        # Add planes as a key, and add the cities in a list as a value
        for shipment, plane in best_solution:
            city = shipment.get('city')
            plane_index = plane.get('name')
            if plane_index not in cities:
                cities[plane_index] = []
            cities[plane_index].append(city)

        if not best_solution:
            # In case of no valid solution, set best_solution as empty
            best_solution = []

        if not unallocated_shipments:
            unallocated_shipments = []

        print("Best Solution:", best_solution)
        print("Unallocated:", unallocated_shipments)
        print("Cities: ", cities)

        # Handle unallocated shipments
        unallocated_shipment_data = []
        for shipment in unallocated_shipments:
            unallocated_shipment_data.append({
                "name": shipment.get('name'),
                "weight": shipment.get('weight'),
                "cost": shipment.get('cost', 'N/A'),
                "city": shipment.get('city')
            })

        global best_solution_global, unallocated_shipments_global
        best_solution_global = best_solution
        unallocated_shipments_global = unallocated_shipment_data

        return jsonify({'success': True, 'cities': cities, 'message': 'Data processed successfully'}), 200

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({'success': False, 'error': f'Unknown error: {str(e)}'}), 500

# process the TSP file and execute genetic algorithm
@app.route('/city_page', methods=['POST'])
def process_cities():
    global planes
    try:
        # 1 Get cities of transported cargo
        city_data = request.get_json()
        if not city_data or 'cities' not in city_data:
            return jsonify({'success': False, 'error': 'Invalid or missing city data'}), 400

        # 2 Declare dictionaries to fill them with best routes and best distances
        routes_info = []  # List to store dictionaries with plane ID, name, best route, and best distance
        cities = city_data['cities']
        # 3 Declare a dictionary, then fill it with an empty dictionaries for each plane
        cities_with_coordinates = {}
        for key in cities.keys():
            cities_with_coordinates[key] = {}

        # 4 Add Damascus in all dictionaries as a central point, then fill the dictionaries for each plane by its cities
        if "Damascus" in CITIES_COORDINATES:
            for key in cities_with_coordinates.keys():
                cities_with_coordinates[key]["Damascus"] = CITIES_COORDINATES["Damascus"]
                for city in cities[key]:
                    if city in CITIES_COORDINATES:  # Check if the city exists in the coordinates dictionary
                        cities_with_coordinates[key][city] = CITIES_COORDINATES[city]  # Map city to its coordinates
        # 5 Execute the genetic algorithm for each plane and store the results in the dictionaries
        for key in cities_with_coordinates.keys():
            object_route = BestRoute(cities_with_coordinates[key], 'Damascus')
            best_route, best_distance = object_route.genetic_algorithm(10, 50, 0.01)
            # Create a dictionary with plane information
            plane_id = next((plane['index'] for plane in planes if plane['name'] == key), 'Unknown ID')
            route_info = {
                'id':plane_id,
                'name': key, 
                'route': best_route,
                'distance': best_distance
            }
            routes_info.append(route_info)  # Add the info to the list
        # 6 Return the routes information to JS
        return jsonify({
            'success': True,
            'routes_info': routes_info,  # Send the new list of routes information
            'message': 'Cities processed successfully'
        }), 200
    except Exception as e:
        print(f"Error processing cities request: {str(e)}")
        return jsonify({'success': False, 'error': f'Unknown error: {str(e)}'}), 500

@app.route('/result_page')
def result_page():
    return render_template(
        'results.html',
        best_solution=best_solution_global,
        unallocated_shipments=unallocated_shipments_global
    )
