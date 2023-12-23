import os
hn = -1
for filename in os.listdir('../clips'):
    hn = max(int(filename[4]), hn)
print(f'clip{hn}.mp4')
