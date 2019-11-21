import random
import json

global data
with open('./static/data/miserables.json', 'r', encoding='utf-8') as file:
    data = json.load(file)
    for i in range(len(data['nodes'])):
        print(i, data['nodes'])
        print(i, data['nodes'][i])
        data['nodes'][i]['asset'] = random.randint(10, 1000)

    print(data)
    # json.dump(data, file)

with open("./static/data/n_miserables.json", "w") as dump_f:
    json.dump(data, dump_f)