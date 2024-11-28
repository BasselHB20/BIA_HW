import random

class ShipmentAllocator:
    def __init__(self, shipments=None, planes=None):
        # إذا لم يتم تمرير قائمة الشحنات والطائرات، فسيتم تهيئتها كقوائم فارغة
        self.shipments = shipments or []
        self.planes = planes or []

    # حساب ملائمة السعة (Fitness)
    def fitness(self, allocation):
        total_value = 0
        # حفظ الأحمال الحالية للطائرات
        plane_loads = {plane['name']: 0 for plane in self.planes}

        for shipment, plane in allocation:
            # إذا كانت الشحنة تتجاوز سعة الطائرة، فإن القيمة تصبح غير قابلة للتحقيق
            if plane_loads[plane['name']] + shipment['weight'] <= plane['capacity']:
                plane_loads[plane['name']] += shipment['weight']
                total_value += shipment['cost']
            else:
                return float('inf')  # قيمة غير قابلة للتحقيق إذا تجاوزت السعة
        return total_value

    def generate_initial_solution(self):
        # ترتيب الطائرات حسب السعة من الأكبر إلى الأصغر
        sorted_planes = sorted(self.planes, key=lambda x: x['capacity'], reverse=True)
        # ترتيب الشحنات حسب الوزن أولاً، ثم الكلفة
        sorted_shipments = sorted(self.shipments, key=lambda x: (x['weight'], x['cost']), reverse=True)

        allocation = []
        unallocated_shipments = []
        plane_loads = {plane['name']: 0 for plane in sorted_planes}

        # تخصيص الشحنات للطائرات
        for shipment in sorted_shipments:
            assigned = self.assign_shipment_to_plane(shipment, sorted_planes, plane_loads)
            if assigned:
                allocation.append(assigned)
            else:
                unallocated_shipments.append(shipment)

        # محاولة تخصيص الشحنات غير المخصصة للطائرات المتبقية
        for shipment in unallocated_shipments:
            assigned = self.assign_shipment_to_plane(shipment, sorted_planes, plane_loads)
            if assigned:
                allocation.append(assigned)

        return allocation, unallocated_shipments

    def assign_shipment_to_plane(self, shipment, sorted_planes, plane_loads):
        """دالة مساعدة لتخصيص الشحنة إلى الطائرة المناسبة"""
        valid_planes = [plane for plane in sorted_planes if plane_loads[plane['name']] + shipment['weight'] <= plane['capacity']]
        if valid_planes:
            plane = valid_planes[0]
            plane_loads[plane['name']] += shipment['weight']
            return (shipment, plane)
        return None
    
    # اختيار افضل الحلول (selection)
    def selection(self, population):
        # حساب ملاءمة كل حل واختيار النصف الأفضل
        fitness_scores = [(self.fitness(sol), sol) for sol in population]
        fitness_scores.sort(key=lambda x: x[0])  # ترتيب حسب الملاءمة
        return [sol for _, sol in fitness_scores[:len(population) // 2]]
    
    # التصالب بين الأفراد (crossover)
    def crossover(self, parent1, parent2):
        # التصالب بين الأفراد واختيار نقطة للتبادل
        if len(parent1) > 1 and len(parent2) > 1:
            point = random.randint(1, len(parent1) - 1)
            child = parent1[:point] + parent2[point:]
            # التأكد من صحة التخصيص بعد التصالب
            return self.ensure_valid_allocation(child)
        return parent1  # في حالة كان طول أحد الأبوين 1 فقط
    
    # اضافة التنوع (mutation)
    def mutate(self, solution, mutation_rate):
        # دالة التغيير (الطفرة) في التخصيص
        plane_loads = {plane['name']: 0 for plane in self.planes}
        # تحديث الأحمال للطائرات بناءً على التخصيص الحالي
        for shipment, plane in solution:
            plane_loads[plane['name']] += shipment['weight']

        # تطبيق الطفرة على بعض الشحنات بناءً على معدل الطفرة
        for i in range(len(solution)):
            if random.random() < mutation_rate:
                shipment, current_plane = solution[i]
                valid_planes = [plane for plane in self.planes if plane_loads[plane['name']] + shipment['weight'] <= plane['capacity']]
                if valid_planes:
                    new_plane = random.choice(valid_planes)
                    plane_loads[current_plane['name']] -= shipment['weight']
                    plane_loads[new_plane['name']] += shipment['weight']
                    solution[i] = (shipment, new_plane)
        return solution
        
    # التأكد من تخصيص الشحنات بشكل سليم بحيث لا تتجاوز سعة الطائرة
    def ensure_valid_allocation(self, allocation):
        plane_loads = {plane['name']: 0 for plane in self.planes}
        valid_allocation = []
        unallocated_shipments = []

        for shipment, plane in allocation:
            if plane_loads[plane['name']] + shipment['weight'] <= plane['capacity']:
                plane_loads[plane['name']] += shipment['weight']
                valid_allocation.append((shipment, plane))
            else:
                unallocated_shipments.append(shipment)  # إذا كانت الشحنة لا تتناسب مع الطائرة

        return valid_allocation

    def genetic_algorithm(self, pop_size, generations, mutation_rate):
        # توليد السكان الأوليين
        population = [self.generate_initial_solution()[0] for _ in range(pop_size)]

        # معالجة الأجيال المتعاقبة
        for _ in range(generations):
            selected_population = self.selection(population)
            next_generation = selected_population[:]

            # التوليد بين الأفراد في الجيل الحالي
            while len(next_generation) < pop_size:
                parent1, parent2 = random.sample(selected_population, 2)
                child = self.crossover(parent1, parent2)
                next_generation.append(self.mutate(child, mutation_rate))

            population = next_generation

        # اختيار أفضل حل بناءً على ملاءمته
        best_solution = min(population, key=lambda x: self.fitness(x))
        allocation, unallocated_shipments = self.generate_initial_solution()

        return best_solution, unallocated_shipments
